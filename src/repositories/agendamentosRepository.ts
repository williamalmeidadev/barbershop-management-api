import { Agendamento, StatusAgendamento, ServicoAgendamento } from '../interfaces/agendamento'
import { db } from '../database/sqlite'
import { Vaga } from '../interfaces/vaga'

export const agendamentosRepository = {
  async criarAgendamento(payload: {
    cliente_id: number,
    barbeiro_id: number,
    inicio: string,
    fim: string,
    status: StatusAgendamento,
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
    for (const servico of servicos) {
      await new Promise<void>((resolve, reject) => {
        db.run(
          `INSERT INTO agendamento_servicos (agendamento_id, servico_id, preco_centavos, duracao_minutos) VALUES (?, ?, ?, ?)`,
          [agendamentoId, servico.id, servico.preco_centavos, servico.duracao_minutos],
          err => {
            if (err) return reject(err)
            resolve()
          }
        )
      })
    }
  },

  async adicionarVagasAoAgendamento(agendamentoId: number, vagas: Vaga[]): Promise<void> {
    for (const vaga of vagas) {
      await new Promise<void>((resolve, reject) => {
        db.run(
          `INSERT INTO agendamento_vagas (agendamento_id, vaga_id) VALUES (?, ?)`,
          [agendamentoId, vaga.id],
          err => {
            if (err) return reject(err)
            resolve()
          }
        )
      })
    }
  },

  async listarAgendamentosComServicosEVagas(): Promise<Agendamento[]> {
    const agendamentos: Agendamento[] = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM agendamentos', [], (err, rows) => {
        if (err) return reject(err)
        resolve(rows as Agendamento[])
      })
    })
    for (const agendamento of agendamentos) {
      agendamento.servicos = await new Promise((resolve, reject) => {
        db.all(
          'SELECT servico_id, preco_centavos, duracao_minutos FROM agendamento_servicos WHERE agendamento_id = ?',
          [agendamento.id],
          (err, rows) => {
            if (err) return reject(err)
            resolve(rows as ServicoAgendamento[])
          }
        )
      })
      agendamento.vagas = await new Promise((resolve, reject) => {
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
    const vagaIds: number[] = await new Promise((resolve, reject) => {
      db.all('SELECT vaga_id FROM agendamento_vagas WHERE agendamento_id = ?', [id], (err, rows) => {
        if (err) return reject(err)
        resolve(rows.map((r: any) => r.vaga_id))
      })
    })
    if (vagaIds.length) {
      await new Promise<void>((resolve, reject) => {
        const placeholders = vagaIds.map(() => '?').join(',')
        db.run(
          `UPDATE vagas SET status = 'DISPONIVEL' WHERE id IN (${placeholders})`,
          vagaIds,
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
        [StatusAgendamento.CANCELADO, id],
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
        [StatusAgendamento.CONCLUIDO, id],
        err => {
          if (err) return reject(err)
          resolve()
        }
      )
    })
  },
}
