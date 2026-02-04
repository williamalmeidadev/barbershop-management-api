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
    if (payload.foto_url !== undefined) {
      fields.push('foto_url = ?')
      values.push(payload.foto_url ?? null)
    }
    if (payload.ativo !== undefined) {
      fields.push('ativo = ?')
      values.push(payload.ativo)
    }

    if (fields.length === 0) {
      throw new Error('Nenhum dado informado para atualização.')
    }

    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE barbeiros SET ${fields.join(', ')} WHERE id = ?`,
        [...values, id],
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
  },

  async countDependencias(id: number): Promise<{ servicos: number; vagas: number; agendamentos: number }> {
    const [servicos, vagas, agendamentos] = await Promise.all([
      new Promise<number>((resolve, reject) => {
        db.get('SELECT COUNT(*) as total FROM servicos WHERE barbeiro_id = ?', [id], (err, row: any) => {
          if (err) return reject(err)
          resolve(Number(row?.total || 0))
        })
      }),
      new Promise<number>((resolve, reject) => {
        db.get('SELECT COUNT(*) as total FROM vagas WHERE barbeiro_id = ?', [id], (err, row: any) => {
          if (err) return reject(err)
          resolve(Number(row?.total || 0))
        })
      }),
      new Promise<number>((resolve, reject) => {
        db.get('SELECT COUNT(*) as total FROM agendamentos WHERE barbeiro_id = ?', [id], (err, row: any) => {
          if (err) return reject(err)
          resolve(Number(row?.total || 0))
        })
      }),
    ])
    return { servicos, vagas, agendamentos }
  },

  async remover(id: number): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM barbeiros WHERE id = ?', [id], function (err) {
        if (err) return reject(err)
        if (this.changes === 0) return reject(new Error('Barbeiro não encontrado.'))
        resolve()
      })
    })
  }
}
