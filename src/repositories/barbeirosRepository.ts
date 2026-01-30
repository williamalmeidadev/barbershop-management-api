import { db } from '../database/sqlite'
import { Barbeiro } from '../interfaces/barbeiro'

export const barbeirosRepository = {
  async criar(payload: {
    nome_profissional: string
    bio?: string | null
    foto_url?: string | null
    ativo: number
  }): Promise<Barbeiro> {
    const barbeiroId = await new Promise<number>((resolve, reject) => {
      db.run(
        `INSERT INTO barbeiros (nome_profissional, bio, foto_url, ativo) VALUES (?, ?, ?, ?)`,
        [payload.nome_profissional, payload.bio ?? null, payload.foto_url ?? null, payload.ativo],
        function (err) {
          if (err) return reject(err)
          resolve(this.lastID)
        }
      )
    })
    const barbeiro = await this.buscarPorId(barbeiroId)
    if (!barbeiro) throw new Error('Barbeiro não encontrado após criação.')
    return barbeiro
  },

  async buscarPorId(id: number): Promise<Barbeiro | null> {
    return await new Promise((resolve, reject) => {
      db.get('SELECT * FROM barbeiros WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err)
        resolve((row as Barbeiro) ?? null)
      })
    })
  },

  async listar(ativo?: number): Promise<Barbeiro[]> {
    const where = typeof ativo === 'number' ? 'WHERE ativo = ?' : ''
    const params = typeof ativo === 'number' ? [ativo] : []
    return await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM barbeiros ${where} ORDER BY nome_profissional ASC`, params, (err, rows) => {
        if (err) return reject(err)
        resolve(rows as Barbeiro[])
      })
    })
  },

  async atualizar(id: number, payload: {
    nome_profissional?: string
    bio?: string | null
    foto_url?: string | null
    ativo?: number
  }): Promise<Barbeiro> {
    const keys = Object.keys(payload)

    // Prevent SQL syntax error if payload is empty
    if (keys.length === 0) {
      throw new Error('Nenhum dado informado para atualização.')
    }

    // Dynamically build SET clause
    const setClause = keys.map((key) => `${key} = ?`).join(', ')
    const values = Object.values(payload)

    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE barbeiros SET ${setClause} WHERE id = ?`,
        [...values, id], // Append ID for the WHERE clause
        function (err) {
          if (err) return reject(err)
          
          // Check if any row was actually updated
          if (this.changes === 0) return reject(new Error('Barbeiro não encontrado.'))
          resolve()
        }
      )
    })

    const atualizado = await this.buscarPorId(id)
    if (!atualizado) throw new Error('Erro ao recuperar barbeiro atualizado.')
    return atualizado
  },

  async desativar(id: number): Promise<Barbeiro> {
    return await this.atualizar(id, { ativo: 0 })
  }
}