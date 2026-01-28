import { Request, Response } from 'express'
import { db } from '../database/sqlite'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET || 'minha_chave_secreta_super_segura'

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' })
    }

    db.get(
      'SELECT * FROM clientes WHERE email = ?',
      [email],
      async (err, user: any) => {
        if (err) {
          return res.status(500).json({ error: 'Erro interno no servidor.' })
        }

        if (!user) {
          return res.status(401).json({ error: 'Credenciais inválidas.' })
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user.password_hash
        )

        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Credenciais inválidas.' })
        }

        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: 'CLIENT'
          },
          SECRET_KEY,
          { expiresIn: '1d' }
        )

        return res.status(200).json({
          user: {
            id: user.id,
            email: user.email,
            role: 'CLIENT'
          },
          token
        })
      }
    )
  }
}