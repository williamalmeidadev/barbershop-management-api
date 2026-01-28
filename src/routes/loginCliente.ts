import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { db } from '../database/sqlite'

const router = Router()

interface ClienteRow {
    id: number
    password_hash: string
    ativo: number
}

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não definido')
}

const JWT_EXPIRATION: SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '1h'

router.post('/login', (req: Request, res: Response) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({
            error: 'Email e senha são obrigatórios'
        })
    }

    db.get(
        `SELECT id, password_hash, ativo FROM clientes WHERE email = ?`,
        [email],
        async (err, row: ClienteRow | undefined) => {
            if (err) {
                return res.status(500).json({ error: 'Erro no banco de dados' })
            }

            if (!row) {
                return res.status(401).json({ error: 'Credenciais inválidas' })
            }

            if (row.ativo === 0) {
                return res.status(403).json({ error: 'Usuário inativo' })
            }

            const senhaValida = await bcrypt.compare(password, row.password_hash)

            if (!senhaValida) {
                return res.status(401).json({ error: 'Credenciais inválidas' })
            }

            const token = jwt.sign(
                { sub: row.id, role: 'cliente' },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRATION }
            )

            return res.status(200).json({ token })
        }
    )
})

export default router