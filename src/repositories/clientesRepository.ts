import { db } from '../database/sqlite'
import { ClienteLoginRow, ClienteResumo } from '../interfaces/cliente'

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

  async create(payload: { nome: string; email: string; telefone?: string | null; password_hash: string }): Promise<number> {
    return await new Promise<number>((resolve, reject) => {
      db.run(
        `INSERT INTO clientes (nome, email, telefone, password_hash) VALUES (?, ?, ?, ?)`,
        [payload.nome, payload.email, payload.telefone ?? null, payload.password_hash],
        function (err) {
          if (err) return reject(err)
          resolve(this.lastID)
        }
      )
    })
  },

  async findLoginByEmail(email: string): Promise<ClienteLoginRow | null> {
    return await new Promise((resolve, reject) => {
      db.get(
        `SELECT id, email, password_hash, ativo FROM clientes WHERE email = ?`,
        [email],
        (err, row) => {
          if (err) return reject(err)
          resolve((row as ClienteLoginRow) ?? null)
        }
      )
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
