import { Booking, BookingStatus, BookingService } from '../interfaces/booking'
import { db } from '../database/sqlite'
import { Slot } from '../interfaces/slot'

export const bookingRepository = {
  async criarAgendamento(payload: {
    cliente_id: number,
    barbeiro_id: number,
    inicio: string,
    fim: string,
    status: BookingStatus,
    valor_total_centavos: number
  }): Promise<number> {
    return await new Promise<number>((resolve, reject) => {
      db.run(
        `INSERT INTO agendamentos (cliente_id, barbeiro_id, inicio, fim, status, valor_total_centavos) VALUES (?, ?, ?, ?, ?, ?)`,
        [payload.cliente_id, payload.barbeiro_id, payload.inicio, payload.fim, payload.status, payload.valor_total_centavos],
        function (err) {
          if (err) return reject(err)
          resolve(this.lastID)
        }
      )
    })
  },

  async adicionarServicosAoAgendamento(agendamentoId: number, servicos: any[]): Promise<void> {
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
  },

  async adicionarSlotsAoAgendamento(agendamentoId: number, slots: Slot[]): Promise<void> {
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
  },

  async listarAgendamentosComServicosESlots(): Promise<Booking[]> {
    const agendamentos: Booking[] = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM agendamentos', [], (err, rows) => {
        if (err) return reject(err)
        resolve(rows as Booking[])
      })
    })
    for (const agendamento of agendamentos) {
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
    const slotIds: number[] = await new Promise((resolve, reject) => {
      db.all('SELECT vaga_id FROM agendamento_vagas WHERE agendamento_id = ?', [id], (err, rows) => {
        if (err) return reject(err)
        resolve(rows.map((r: any) => r.vaga_id))
      })
    })
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
