import { Servico } from '../interfaces/servico'
import { db } from '../database/sqlite'

export const servicoService = {
  async buscarPorIds(ids: number[]): Promise<Servico[]> {
    return new Promise((resolve, reject) => {
      if (ids.length === 0) return resolve([])
      const placeholders = ids.map(() => '?').join(',')
      db.all(
        `SELECT * FROM servicos WHERE id IN (${placeholders}) AND ativo = 1`,
        ids,
        (err, rows) => {
          if (err) return reject(err)
          resolve(rows as Servico[])
        }
      )
    })
  },
}
