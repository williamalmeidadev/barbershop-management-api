import { Servico } from '../interfaces/servico'
import { db } from '../database/sqlite'

export const servicoRepository = {
  async findByIds(ids: number[], barbeiroId?: number): Promise<Servico[]> {
    return new Promise((resolve, reject) => {
      if (ids.length === 0) return resolve([])
      const placeholders = ids.map(() => '?').join(',')
      const params = [...ids]
      const barberFilter = typeof barbeiroId === 'number' ? ' AND barbeiro_id = ?' : ''
      if (typeof barbeiroId === 'number') params.push(barbeiroId)
      db.all(
        `SELECT * FROM servicos WHERE id IN (${placeholders}) AND ativo = 1${barberFilter}`,
        params,
        (err, rows) => {
          if (err) return reject(err)
          resolve(rows as Servico[])
        }
      )
    })
  },

  async create(payload: {
    barbeiro_id: number
    nome: string
    descricao?: string | null
    duracao_minutos: number
    preco_centavos: number
    foto_url?: string | null
    ativo: number
  }): Promise<Servico> {
    const servicoId = await new Promise<number>((resolve, reject) => {
      db.run(
        `INSERT INTO servicos (barbeiro_id, nome, descricao, duracao_minutos, preco_centavos, foto_url, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [payload.barbeiro_id, payload.nome, payload.descricao ?? null, payload.duracao_minutos, payload.preco_centavos, payload.foto_url ?? null, payload.ativo],
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

  async list(ativo?: number, barbeiroId?: number): Promise<Servico[]> {
    const clauses: string[] = []
    const params: any[] = []
    if (typeof ativo === 'number') {
      clauses.push('ativo = ?')
      params.push(ativo)
    }
    if (typeof barbeiroId === 'number') {
      clauses.push('barbeiro_id = ?')
      params.push(barbeiroId)
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
    return await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM servicos ${where} ORDER BY nome ASC`, params, (err, rows) => {
        if (err) return reject(err)
        resolve(rows as Servico[])
      })
    })
  },

  async update(id: number, payload: {
    barbeiro_id?: number
    nome?: string
    descricao?: string | null
    duracao_minutos?: number
    preco_centavos?: number
    foto_url?: string | null
    ativo?: number
  }): Promise<Servico> {
    const fields: string[] = []
    const values: any[] = []

    if (payload.barbeiro_id !== undefined) {
      fields.push('barbeiro_id = ?')
      values.push(payload.barbeiro_id)
    }
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
    if (payload.foto_url !== undefined) {
      fields.push('foto_url = ?')
      values.push(payload.foto_url ?? null)
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

  async countAgendamentoReferencias(id: number): Promise<number> {
    return await new Promise<number>((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as total FROM agendamento_servicos WHERE servico_id = ?',
        [id],
        (err, row: any) => {
          if (err) return reject(err)
          resolve(Number(row?.total || 0))
        }
      )
    })
  },

  async remove(id: number): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM servicos WHERE id = ?', [id], function (err) {
        if (err) return reject(err)
        if (this.changes === 0) return reject(new Error('Serviço não encontrado.'))
        resolve()
      })
    })
  },
}
