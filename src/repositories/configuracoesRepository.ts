import { db } from '../database/sqlite'

export const configuracoesRepository = {
  async getInt(chave: string): Promise<number | null> {
    return await new Promise((resolve, reject) => {
      db.get('SELECT valor_int FROM configuracoes WHERE chave = ?', [chave], (err, row: { valor_int?: number } | undefined) => {
        if (err) return reject(err)
        if (!row || row.valor_int === null || row.valor_int === undefined) return resolve(null)
        resolve(Number(row.valor_int))
      })
    })
  },

  async setInt(chave: string, valor: number): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      db.run(
        `INSERT INTO configuracoes (chave, valor_int, updated_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(chave) DO UPDATE SET valor_int = excluded.valor_int, updated_at = CURRENT_TIMESTAMP`,
        [chave, valor],
        (err) => {
          if (err) return reject(err)
          resolve()
        }
      )
    })
  },
}
