import { db } from '../database/sqlite'

export const configuracoesRepository = {
  async getInt(chave: string): Promise<number | null> {
    return await new Promise((resolve, reject) => {
      db.get('SELECT valor_int FROM configuracoes WHERE chave = ?', [chave], (err, row) => {
        if (err) return reject(err)
        if (!row || row.valor_int === null || row.valor_int === undefined) return resolve(null)
        resolve(Number(row.valor_int))
      })
    })
  },
}
