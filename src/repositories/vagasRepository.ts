import { Vaga, StatusVaga } from '../interfaces/vaga'
import { db } from '../database/sqlite'

export const vagasRepository = {

  async buscarVagasPorIds(ids: number[]): Promise<Vaga[]> {
    if (!ids.length) return []
    const placeholders = ids.map(() => '?').join(',')
    return await new Promise<Vaga[]>((resolve, reject) => {
      db.all(
        `SELECT * FROM vagas WHERE id IN (${placeholders})`,
        ids,
        (err, rows) => {
          if (err) return reject(err)
          resolve(rows as Vaga[])
        }
      )
    })
  },

  async verificarAgendamentoNaVaga(vagaId: number): Promise<boolean> {
    return await new Promise<boolean>((resolve, reject) => {
      db.get(
        `SELECT 1 FROM agendamento_vagas WHERE vaga_id = ?`,
        [vagaId],
        (err, row) => {
          if (err) return reject(err)
          resolve(!!row)
        }
      )
    })
  },

  async apagarVaga(vagaId: number): Promise<boolean> {
    return await new Promise<boolean>((resolve, reject) => {
      db.run(
        `DELETE FROM vagas WHERE id = ?`,
        [vagaId],
        function (err) {
          if (err) return reject(err)
          resolve(this.changes > 0)
        }
      )
    })
  },
  async buscarTodasPorBarbeiroEData(barbeiroId: number, data: string): Promise<Vaga[]> {
    const inicioDia = `${data}T00:00:00.000Z`
    const proximoDia = new Date(inicioDia)
    proximoDia.setUTCDate(proximoDia.getUTCDate() + 1)
    return await new Promise<Vaga[]>((resolve, reject) => {
      db.all(
        `SELECT * FROM vagas WHERE barbeiro_id = ? AND inicio >= ? AND inicio < ? ORDER BY inicio ASC`,
        [barbeiroId, inicioDia, proximoDia.toISOString()],
        (err, rows) => {
          if (err) return reject(err)
          resolve(rows as Vaga[])
        }
      )
    })
  },

  async criarVagasParaBarbeiro(barbeiroId: number, data: string, inicioExpediente: string, fimExpediente: string, duracaoVaga: number): Promise<Vaga[]> {
    const vagas: Vaga[] = []
    const [ano, mes, dia] = data.split('-').map(Number)
    const [hIni, mIni] = inicioExpediente.split(':').map(Number)
    const [hFim, mFim] = fimExpediente.split(':').map(Number)
    const start = new Date(ano, mes - 1, dia, hIni, mIni)
    const end = new Date(ano, mes - 1, dia, hFim, mFim)
    let atual = new Date(start)
    while (atual < end) {
      const vagaInicio = new Date(atual)
      const vagaFim = new Date(atual)
      vagaFim.setMinutes(vagaFim.getMinutes() + duracaoVaga)
      if (vagaFim > end) break
      const exists = await new Promise<boolean>((resolve, reject) => {
        db.get(
          `SELECT 1 FROM vagas WHERE barbeiro_id = ? AND inicio = ? AND fim = ?`,
          [barbeiroId, vagaInicio.toISOString(), vagaFim.toISOString()],
          (err, row) => {
            if (err) return reject(err)
            resolve(!!row)
          }
        )
      })
      if (!exists) {
        await new Promise<void>((resolve, reject) => {
          db.run(
            `INSERT INTO vagas (barbeiro_id, inicio, fim, status) VALUES (?, ?, ?, 'DISPONIVEL')`,
            [barbeiroId, vagaInicio.toISOString(), vagaFim.toISOString()],
            err => {
              if (err) return reject(err)
              resolve()
            }
          )
        })
      }
      vagas.push({
        id: 0,
        barbeiro_id: barbeiroId,
        inicio: vagaInicio.toISOString(),
        fim: vagaFim.toISOString(),
        status: StatusVaga.DISPONIVEL,
      })
      atual = vagaFim
    }
    return this.buscarDisponiveisPorBarbeiroEData(barbeiroId, data)
  },

  async buscarDisponiveisPorBarbeiroEData(barbeiroId: number, data: string): Promise<Vaga[]> {
    const inicioDia = `${data}T00:00:00.000Z`
    const proximoDia = new Date(inicioDia)
    proximoDia.setUTCDate(proximoDia.getUTCDate() + 1)
    return await new Promise<Vaga[]>((resolve, reject) => {
      db.all(
        `SELECT * FROM vagas WHERE barbeiro_id = ? AND inicio >= ? AND inicio < ? AND status = 'DISPONIVEL' ORDER BY inicio ASC`,
        [barbeiroId, inicioDia, proximoDia.toISOString()],
        (err, rows) => {
          if (err) return reject(err)
          resolve(rows as Vaga[])
        }
      )
    })
  },

  async buscarVagasConsecutivas(barbeiroId: number, inicio: string, quantidade: number): Promise<Vaga[]> {
    return await new Promise<Vaga[]>((resolve, reject) => {
      db.all(
        `SELECT * FROM vagas WHERE barbeiro_id = ? AND inicio >= ? AND status = 'DISPONIVEL' ORDER BY inicio ASC LIMIT ?`,
        [barbeiroId, inicio, quantidade],
        (err, rows) => {
          if (err) return reject(err)
          resolve(rows as Vaga[])
        }
      )
    })
  },

  async atualizarStatusLote(vagaIds: number[], status: StatusVaga): Promise<void> {
    if (!vagaIds.length) return
    await new Promise<void>((resolve, reject) => {
      const placeholders = vagaIds.map(() => '?').join(',')
      db.run(
        `UPDATE vagas SET status = ? WHERE id IN (${placeholders})`,
        [status, ...vagaIds],
        err => {
          if (err) return reject(err)
          resolve()
        }
      )
    })
  },

  async bloquearIntervalo(barbeiroId: number, inicio: string, fim: string): Promise<Vaga[]> {
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE vagas SET status = 'BLOQUEADO' WHERE barbeiro_id = ? AND inicio >= ? AND fim <= ? AND status = 'DISPONIVEL'`,
        [barbeiroId, inicio, fim],
        err => {
          if (err) return reject(err)
          resolve()
        }
      )
    })
    return await new Promise<Vaga[]>((resolve, reject) => {
      db.all(
        `SELECT * FROM vagas WHERE barbeiro_id = ? AND inicio >= ? AND fim <= ? AND status = 'BLOQUEADO'`,
        [barbeiroId, inicio, fim],
        (err, rows) => {
          if (err) return reject(err)
          resolve(rows as Vaga[])
        }
      )
    })
  },

  async liberarVagas(vagaIds: number[]): Promise<Vaga[]> {
    if (!vagaIds.length) return []
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
    return await new Promise<Vaga[]>((resolve, reject) => {
      const placeholders = vagaIds.map(() => '?').join(',')
      db.all(
        `SELECT * FROM vagas WHERE id IN (${placeholders})`,
        vagaIds,
        (err, rows) => {
          if (err) return reject(err)
          resolve(rows as Vaga[])
        }
      )
    })
  },
}
