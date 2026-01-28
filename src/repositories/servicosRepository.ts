import { Servico } from '../interfaces/servico'
import { db } from '../database/sqlite'

export const servicoRepository = {
  async findByIds(ids: number[]): Promise<Servico[]> {
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

  async create(payload: {
    nome: string
    descricao?: string | null
    duracao_minutos: number
    preco_centavos: number
    ativo: number
  }): Promise<Servico> {
    const servicoId = await new Promise<number>((resolve, reject) => {
      db.run(
        `INSERT INTO servicos (nome, descricao, duracao_minutos, preco_centavos, ativo) VALUES (?, ?, ?, ?, ?)`,
        [payload.nome, payload.descricao ?? null, payload.duracao_minutos, payload.preco_centavos, payload.ativo],
        function (err) {
          if (err) return reject(err)
          resolve(this.lastID)
        }
      )
    })
    const servico = await this.findById(servicoId)
    if (!servico) throw new Error('Serviço não encontrado após criação.')
    return servico
  },

  async findById(id: number): Promise<Servico | null> {
    return await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM servicos WHERE id = ?`, [id], (err, row) => {
        if (err) return reject(err)
        resolve((row as Servico) ?? null)
      })
    })
  },

  async list(ativo?: number): Promise<Servico[]> {
    const where = typeof ativo === 'number' ? 'WHERE ativo = ?' : ''
    const params = typeof ativo === 'number' ? [ativo] : []
    return await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM servicos ${where} ORDER BY nome ASC`, params, (err, rows) => {
        if (err) return reject(err)
        resolve(rows as Servico[])
      })
    })
  },

  async update(id: number, payload: {
    nome?: string
    descricao?: string | null
    duracao_minutos?: number
    preco_centavos?: number
    ativo?: number
  }): Promise<Servico> {
    const fields: string[] = []
    const values: any[] = []

    if (payload.nome !== undefined) {
      fields.push('nome = ?')
      values.push(payload.nome)
    }
    if (payload.descricao !== undefined) {
      fields.push('descricao = ?')
      values.push(payload.descricao ?? null)
    }
    if (payload.duracao_minutos !== undefined) {
      fields.push('duracao_minutos = ?')
      values.push(payload.duracao_minutos)
    }
    if (payload.preco_centavos !== undefined) {
      fields.push('preco_centavos = ?')
      values.push(payload.preco_centavos)
    }
    if (payload.ativo !== undefined) {
      fields.push('ativo = ?')
      values.push(payload.ativo)
    }

    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE servicos SET ${fields.join(', ')} WHERE id = ?`,
        [...values, id],
        function (err) {
          if (err) return reject(err)
          if (this.changes === 0) return reject(new Error('Serviço não encontrado.'))
          resolve()
        }
      )
    })
    const atualizado = await this.findById(id)
    if (!atualizado) throw new Error('Serviço não encontrado.')
    return atualizado
  },

  async deactivate(id: number): Promise<Servico> {
    return await this.update(id, { ativo: 0 })
  },
}
