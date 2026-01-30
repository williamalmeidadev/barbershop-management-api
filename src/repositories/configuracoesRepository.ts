import { db } from '../database/sqlite'

export const configuracoesRepository = {
  async getInt(chave: string): Promise<number | null> {
    return await new Promise((resolve, reject) => {
      db.get('SELECT valor_int FROM configuracoes WHERE chave = ?', [chave], (err, row) => {
        if (err) return reject(err)
        const result = row as { valor_int?: number | null } | undefined
        if (!result || result.valor_int === null || result.valor_int === undefined) return resolve(null)
        resolve(Number(result.valor_int))
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

  async delete(chave: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      db.run(`DELETE FROM configuracoes WHERE chave = ?`, [chave], (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  },
}
