import { db } from '../database/sqlite'
import { AdminLoginRow } from '../interfaces/admin'

export const adminsRepository = {
  async findByEmailOrUsuario(email: string, usuario: string): Promise<{ id: number } | null> {
    return await new Promise((resolve, reject) => {
      db.get(
        `SELECT id FROM admins WHERE email = ? OR usuario = ?`,
        [email, usuario],
        (err, row) => {
          if (err) return reject(err)
          resolve((row as { id: number }) ?? null)
        }
      )
    })
  },

  async create(payload: { usuario: string; nome: string; email?: string | null; password_hash: string }): Promise<number> {
    return await new Promise<number>((resolve, reject) => {
      db.run(
        `INSERT INTO admins (usuario, nome, email, password_hash, ativo) VALUES (?, ?, ?, ?, 1)`,
        [payload.usuario, payload.nome, payload.email ?? null, payload.password_hash],
        function (err) {
          if (err) return reject(err)
          resolve(this.lastID)
        }
      )
    })
  },

  async findLoginByEmail(email: string): Promise<AdminLoginRow | null> {
    return await new Promise((resolve, reject) => {
      db.get(
        `SELECT id, email, password_hash, ativo FROM admins WHERE email = ?`,
        [email],
        (err, row) => {
          if (err) return reject(err)
          resolve((row as AdminLoginRow) ?? null)
        }
      )
    })
  }
}
