import { Booking, BookingStatus, CreateBookingPayload, BookingService } from '../interfaces/booking'
import { db } from '../database/sqlite'
import { servicoService } from './servicoService'
import { slotService } from './slotService'
import { Slot } from '../interfaces/slot'

export const bookingService = {
  async criarAgendamento(payload: CreateBookingPayload): Promise<Booking> {
    // 1. Buscar dados dos serviços
    const servicos = await servicoService.buscarPorIds(payload.servicos)
    if (servicos.length !== payload.servicos.length) {
      throw new Error('Um ou mais serviços não encontrados ou inativos')
    }
    // 2. Calcular duração total e valor total
    const duracaoTotal = servicos.reduce((acc, s) => acc + s.duracao_minutos, 0)
    const valorTotal = servicos.reduce((acc, s) => acc + s.preco_centavos, 0)
    // 3. Buscar slots disponíveis para o barbeiro e horário desejado
    const slots = await slotService.reservarSlotsParaAgendamento(
      payload.barbeiro_id,
      payload.inicio_desejado,
      duracaoTotal
    )
    if (!slots || slots.length === 0) {
      throw new Error('Não há slots disponíveis para o horário e duração desejados')
    }
    // 4. Criar agendamento e relacionamentos
    const inicio = slots[0].inicio
    const fim = slots[slots.length - 1].fim
    const agendamentoId = await new Promise<number>((resolve, reject) => {
      db.run(
        `INSERT INTO agendamentos (cliente_id, barbeiro_id, inicio, fim, status, valor_total_centavos) VALUES (?, ?, ?, ?, ?, ?)`,
        [payload.cliente_id, payload.barbeiro_id, inicio, fim, BookingStatus.AGENDADO, valorTotal],
        function (err) {
          if (err) return reject(err)
          resolve(this.lastID)
        }
      )
    })
    // 5. Relacionar serviços ao agendamento
    for (const s of servicos) {
      await new Promise<void>((resolve, reject) => {
        db.run(
          `INSERT INTO agendamento_servicos (agendamento_id, servico_id, preco_centavos, duracao_minutos) VALUES (?, ?, ?, ?)`,
          [agendamentoId, s.id, s.preco_centavos, s.duracao_minutos],
          err => {
            if (err) return reject(err)
            resolve()
          }
        )
      })
    }
    // 6. Relacionar slots ao agendamento
    for (const slot of slots) {
      await new Promise<void>((resolve, reject) => {
        db.run(
          `INSERT INTO agendamento_vagas (agendamento_id, vaga_id) VALUES (?, ?)`,
          [agendamentoId, slot.id],
          err => {
            if (err) return reject(err)
            resolve()
          }
        )
      })
    }
    // 7. Montar objeto de retorno
    return {
      id: agendamentoId,
      cliente_id: payload.cliente_id,
      barbeiro_id: payload.barbeiro_id,
      inicio,
      fim,
      status: BookingStatus.AGENDADO,
      valor_total_centavos: valorTotal,
      created_at: new Date().toISOString(),
      servicos: servicos.map(s => ({
        servico_id: s.id,
        preco_centavos: s.preco_centavos,
        duracao_minutos: s.duracao_minutos,
      })),
      slots: slots.map(s => s.id),
    }
  },


  async listarAgendamentos(): Promise<Booking[]> {
    // Listar todos os agendamentos com serviços e slots
    const agendamentos: Booking[] = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM agendamentos', [], (err, rows) => {
        if (err) return reject(err)
        resolve(rows as Booking[])
      })
    })
    for (const agendamento of agendamentos) {
      // Buscar serviços
      agendamento.servicos = await new Promise((resolve, reject) => {
        db.all(
          'SELECT servico_id, preco_centavos, duracao_minutos FROM agendamento_servicos WHERE agendamento_id = ?',
          [agendamento.id],
          (err, rows) => {
            if (err) return reject(err)
            resolve(rows as BookingService[])
          }
        )
      })
      // Buscar slots
      agendamento.slots = await new Promise((resolve, reject) => {
        db.all(
          'SELECT vaga_id FROM agendamento_vagas WHERE agendamento_id = ?',
          [agendamento.id],
          (err, rows) => {
            if (err) return reject(err)
            resolve(rows.map((r: any) => r.vaga_id))
          }
        )
      })
    }
    return agendamentos
  },


  async cancelarAgendamento(id: number): Promise<void> {
    // Buscar slots do agendamento
    const slotIds: number[] = await new Promise((resolve, reject) => {
      db.all('SELECT vaga_id FROM agendamento_vagas WHERE agendamento_id = ?', [id], (err, rows) => {
        if (err) return reject(err)
        resolve(rows.map((r: any) => r.vaga_id))
      })
    })
    // Liberar slots
    if (slotIds.length) {
      await new Promise<void>((resolve, reject) => {
        const placeholders = slotIds.map(() => '?').join(',')
        db.run(
          `UPDATE vagas SET status = 'DISPONIVEL' WHERE id IN (${placeholders})`,
          slotIds,
          err => {
            if (err) return reject(err)
            resolve()
          }
        )
      })
    }
    // Atualizar status do agendamento
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE agendamentos SET status = ? WHERE id = ?`,
        [BookingStatus.CANCELADO, id],
        err => {
          if (err) return reject(err)
          resolve()
        }
      )
    })
  },

  async concluirAgendamento(id: number): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE agendamentos SET status = ? WHERE id = ?`,
        [BookingStatus.CONCLUIDO, id],
        err => {
          if (err) return reject(err)
          resolve()
        }
      )
    })
  },
}
