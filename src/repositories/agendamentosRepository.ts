import { Agendamento, StatusAgendamento, ServicoAgendamento } from '../interfaces/agendamento'
import { db } from '../database/sqlite'
import { Vaga } from '../interfaces/vaga'

export const agendamentosRepository = {
  async buscarAgendamentoPorId(id: number): Promise<Agendamento | null> {
    return await new Promise((resolve, reject) => {
      db.get('SELECT * FROM agendamentos WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err)
        resolve((row as Agendamento) ?? null)
      })
    })
  },

  async criarAgendamento(payload: {
    cliente_id: number,
    barbeiro_id: number,
    inicio: string,
    fim: string,
    status: StatusAgendamento,
    valor_original_centavos: number,
    desconto_aplicado_centavos: number,
    valor_total_centavos: number
  }): Promise<number> {
    return await new Promise<number>((resolve, reject) => {
      db.run(
        `INSERT INTO agendamentos (cliente_id, barbeiro_id, inicio, fim, status, valor_original_centavos, desconto_aplicado_centavos, valor_total_centavos)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          payload.cliente_id,
          payload.barbeiro_id,
          payload.inicio,
          payload.fim,
          payload.status,
          payload.valor_original_centavos,
          payload.desconto_aplicado_centavos,
          payload.valor_total_centavos
        ],
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
    return await hydrateAgendamentos(agendamentos)
  },

  async listarAgendamentosDoCliente(clienteId: number): Promise<Agendamento[]> {
    const agendamentos: Agendamento[] = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM agendamentos WHERE cliente_id = ? ORDER BY inicio DESC', [clienteId], (err, rows) => {
        if (err) return reject(err)
        resolve(rows as Agendamento[])
      })
    })
    return await hydrateAgendamentos(agendamentos)
  },

  async buscarAgendamentoCompleto(id: number): Promise<Agendamento | null> {
    const agendamento = await this.buscarAgendamentoPorId(id)
    if (!agendamento) return null
    const completos = await hydrateAgendamentos([agendamento])
    return completos[0] ?? null
  },

  async buscarVagasDoAgendamento(id: number): Promise<Vaga[]> {
    return await new Promise((resolve, reject) => {
      db.all(
        `SELECT v.* FROM vagas v
         INNER JOIN agendamento_vagas av ON av.vaga_id = v.id
         WHERE av.agendamento_id = ?
         ORDER BY v.inicio ASC`,
        [id],
        (err, rows) => {
          if (err) return reject(err)
          resolve(rows as Vaga[])
        }
      )
    })
  },

  async cancelarAgendamento(id: number, liberarVagas: boolean): Promise<void> {
    if (liberarVagas) {
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

  async atualizarStatus(id: number, status: StatusAgendamento): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE agendamentos SET status = ? WHERE id = ?`,
        [status, id],
        err => {
          if (err) return reject(err)
          resolve()
        }
      )
    })
  },

  async concluirAgendamento(id: number, concluidoEm?: string, pagamentoTipo?: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE agendamentos SET status = ?, concluido_em = ?, pagamento_tipo = ? WHERE id = ?`,
        [StatusAgendamento.CONCLUIDO, concluidoEm ?? null, pagamentoTipo ?? null, id],
        err => {
          if (err) return reject(err)
          resolve()
        }
      )
    })
  },
}

async function hydrateAgendamentos(agendamentos: Agendamento[]): Promise<Agendamento[]> {
  for (const agendamento of agendamentos) {
    agendamento.cliente = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, nome FROM clientes WHERE id = ?',
        [agendamento.cliente_id],
        (err, row) => {
          if (err) return reject(err)
          resolve((row as any) ?? null)
        }
      )
    })
    agendamento.barbeiro = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, nome_profissional, bio FROM barbeiros WHERE id = ?',
        [agendamento.barbeiro_id],
        (err, row) => {
          if (err) return reject(err)
          resolve((row as any) ?? null)
        }
      )
    })
    agendamento.servicos = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          asv.servico_id,
          asv.preco_centavos,
          asv.duracao_minutos,
          s.nome,
          s.descricao
         FROM agendamento_servicos asv
         INNER JOIN servicos s ON s.id = asv.servico_id
         WHERE asv.agendamento_id = ?`,
        [agendamento.id],
        (err, rows) => {
          if (err) return reject(err)
          resolve(rows as ServicoAgendamento[])
        }
      )
    })
    agendamento.vagas = await new Promise((resolve, reject) => {
      db.all(
        `SELECT v.id, v.inicio, v.fim, v.status
         FROM agendamento_vagas av
         INNER JOIN vagas v ON v.id = av.vaga_id
         WHERE av.agendamento_id = ?
         ORDER BY v.inicio ASC`,
        [agendamento.id],
        (err, rows) => {
          if (err) return reject(err)
          resolve(rows as any)
        }
      )
    })
  }
  return agendamentos
}
