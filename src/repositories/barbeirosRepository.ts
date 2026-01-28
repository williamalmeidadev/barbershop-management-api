import { db } from '../database/sqlite'
import { Barbeiro } from '../interfaces/barbeiro'

export const barbeirosRepository = {
  async criar(payload: {
    nome_profissional: string
    bio?: string | null
    ativo: number
  }): Promise<Barbeiro> {
    const barbeiroId = await new Promise<number>((resolve, reject) => {
      db.run(
        `INSERT INTO barbeiros (nome_profissional, bio, ativo) VALUES (?, ?, ?)`,
        [payload.nome_profissional, payload.bio ?? null, payload.ativo],
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
    ativo?: number
  }): Promise<Barbeiro> {
    const fields: string[] = []
    const values: any[] = []

    if (payload.nome_profissional !== undefined) {
      fields.push('nome_profissional = ?')
      values.push(payload.nome_profissional)
    }
    if (payload.bio !== undefined) {
      fields.push('bio = ?')
      values.push(payload.bio ?? null)
    }
    if (payload.ativo !== undefined) {
      fields.push('ativo = ?')
      values.push(payload.ativo)
    }

    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE barbeiros SET ${fields.join(', ')} WHERE id = ?`,
        [...values, id],
        function (err) {
          if (err) return reject(err)
          if (this.changes === 0) return reject(new Error('Barbeiro não encontrado.'))
          resolve()
        }
      )
    })

    const atualizado = await this.buscarPorId(id)
    if (!atualizado) throw new Error('Barbeiro não encontrado.')
    return atualizado
  },

  async desativar(id: number): Promise<Barbeiro> {
    return await this.atualizar(id, { ativo: 0 })
  }
}
