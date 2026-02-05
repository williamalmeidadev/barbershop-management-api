import { db } from '../database/sqlite'
import { Cliente, ClienteLoginRow, ClienteResumo } from '../interfaces/cliente'

export const clientesRepository = {
  async buscarResumo(id: number): Promise<ClienteResumo | null> {
    return await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, concluidos_count, desconto_disponivel_centavos FROM clientes WHERE id = ?',
        [id],
        (err, row) => {
          if (err) return reject(err)
          resolve((row as ClienteResumo) ?? null)
        }
      )
    })
  },

  async findByEmail(email: string): Promise<{ id: number } | null> {
    return await new Promise((resolve, reject) => {
      db.get('SELECT id FROM clientes WHERE email = ?', [email], (err, row) => {
        if (err) return reject(err)
        resolve((row as { id: number }) ?? null)
      })
    })
  },

  async findByEmailExcludingId(email: string, id: number): Promise<{ id: number } | null> {
    return await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM clientes WHERE email = ? AND id != ?',
        [email, id],
        (err, row) => {
          if (err) return reject(err)
          resolve((row as { id: number }) ?? null)
        }
      )
    })
  },

  async create(payload: { nome: string; email: string; telefone?: string | null; password_hash: string; verification_token: string }): Promise<number> {
    return await new Promise<number>((resolve, reject) => {
      db.run(
        `INSERT INTO clientes (nome, email, telefone, password_hash, verification_token, is_verified) VALUES (?, ?, ?, ?, ?, 0)`,
        [payload.nome, payload.email, payload.telefone ?? null, payload.password_hash, payload.verification_token],
        function (err) {
          if (err) return reject(err)
          resolve(this.lastID)
        }
      )
    })
  },

  async findByVerificationToken(token: string): Promise<{ id: number } | null> {
    return await new Promise((resolve, reject) => {
      db.get('SELECT id FROM clientes WHERE verification_token = ?', [token], (err, row) => {
        if (err) return reject(err)
        resolve((row as { id: number }) ?? null)
      })
    })
  },

  async verify(id: number): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      db.run('UPDATE clientes SET is_verified = 1, verification_token = NULL WHERE id = ?', [id], (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  },

  async findLoginByEmail(email: string): Promise<ClienteLoginRow | null> {
    return await new Promise((resolve, reject) => {
      db.get(
        `SELECT id, email, password_hash, ativo, is_verified FROM clientes WHERE email = ?`,
        [email],
        (err, row) => {
          if (err) return reject(err)
          resolve((row as ClienteLoginRow) ?? null)
        }
      )
    })
  },

  async list(ativo?: number): Promise<Cliente[]> {
    const where = typeof ativo === 'number' ? 'WHERE ativo = ?' : ''
    const params = typeof ativo === 'number' ? [ativo] : []
    return await new Promise((resolve, reject) => {
      db.all(
        `SELECT id, nome, email, telefone, ativo, concluidos_count, desconto_disponivel_centavos FROM clientes ${where} ORDER BY nome ASC`,
        params,
        (err, rows) => {
          if (err) return reject(err)
          resolve(rows as Cliente[])
        }
      )
    })
  },

  async listSimpleAtivos(): Promise<Array<{ id: number; nome: string }>> {
    return await new Promise((resolve, reject) => {
      db.all(
        `SELECT id, nome FROM clientes WHERE ativo = 1 ORDER BY nome ASC`,
        [],
        (err, rows) => {
          if (err) return reject(err)
          resolve(rows as Array<{ id: number; nome: string }>)
        }
      )
    })
  },

  async findById(id: number): Promise<Cliente | null> {
    return await new Promise((resolve, reject) => {
      db.get(
        `SELECT id, nome, email, telefone, ativo, concluidos_count, desconto_disponivel_centavos, is_verified, verification_token FROM clientes WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) return reject(err)
          resolve((row as Cliente) ?? null)
        }
      )
    })
  },

  async update(id: number, payload: { nome?: string; email?: string; telefone?: string | null; ativo?: number }): Promise<Cliente> {
    const fields: string[] = []
    const values: any[] = []

    if (payload.nome !== undefined) {
      fields.push('nome = ?')
      values.push(payload.nome)
    }
    if (payload.email !== undefined) {
      fields.push('email = ?')
      values.push(payload.email)
    }
    if (payload.telefone !== undefined) {
      fields.push('telefone = ?')
      values.push(payload.telefone ?? null)
    }
    if (payload.ativo !== undefined) {
      fields.push('ativo = ?')
      values.push(payload.ativo)
    }

    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE clientes SET ${fields.join(', ')} WHERE id = ?`,
        [...values, id],
        function (err) {
          if (err) return reject(err)
          if (this.changes === 0) return reject(new Error('Cliente não encontrado.'))
          resolve()
        }
      )
    })

    const atualizado = await this.findById(id)
    if (!atualizado) throw new Error('Cliente não encontrado.')
    return atualizado
  },

  async deactivate(id: number): Promise<Cliente> {
    return await this.update(id, { ativo: 0 })
  },

  async countAgendamentos(id: number): Promise<number> {
    return await new Promise<number>((resolve, reject) => {
      db.get('SELECT COUNT(*) as total FROM agendamentos WHERE cliente_id = ?', [id], (err, row: any) => {
        if (err) return reject(err)
        resolve(Number(row?.total || 0))
      })
    })
  },

  async remove(id: number): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM clientes WHERE id = ?', [id], function (err) {
        if (err) return reject(err)
        if (this.changes === 0) return reject(new Error('Cliente não encontrado.'))
        resolve()
      })
    })
  },

  async atualizarContagemEDesconto(id: number, concluidosCount: number, descontoDisponivel?: number | null): Promise<void> {
    const fields = ['concluidos_count = ?']
    const values: any[] = [concluidosCount]

    if (descontoDisponivel !== undefined) {
      fields.push('desconto_disponivel_centavos = ?')
      values.push(descontoDisponivel)
    }

    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE clientes SET ${fields.join(', ')} WHERE id = ?`,
        [...values, id],
        function (err) {
          if (err) return reject(err)
          if (this.changes === 0) return reject(new Error('Cliente não encontrado.'))
          resolve()
        }
      )
    })
  },
}
