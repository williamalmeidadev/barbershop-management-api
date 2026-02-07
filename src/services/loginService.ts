import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { SignOptions } from 'jsonwebtoken'
import { adminsRepository } from '../repositories/adminsRepository'
import { clientesRepository } from '../repositories/clientesRepository'
import { AdminLoginPayload } from '../interfaces/admin'
import { ClienteLoginPayload } from '../interfaces/cliente'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não definido')
}

const JWT_EXPIRATION: SignOptions['expiresIn'] =
  (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '1h'

export const loginService = {
  async loginCliente(payload: ClienteLoginPayload): Promise<{ token: string }> {
    const { email, password } = payload
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios')
    }

    const cliente = await clientesRepository.findLoginByEmail(email)
    if (!cliente) {
      throw new Error('Credenciais inválidas')
    }

    if (cliente.ativo === 0) {
      throw new Error('Usuário inativo')
    }

    if (!cliente.is_verified) {
      throw new Error('Email não verificado.')
    }

    const senhaValida = await bcrypt.compare(password, cliente.password_hash)
    if (!senhaValida) {
      throw new Error('Credenciais inválidas')
    }

    const token = jwt.sign(
      { id: cliente.id, email: cliente.email, role: 'cliente' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    )

    return { token }
  },

  async loginAdmin(payload: AdminLoginPayload): Promise<{ token: string }> {
    const { email, password } = payload
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios')
    }

    const admin = await adminsRepository.findLoginByEmail(email)
    if (!admin) {
      throw new Error('Credenciais inválidas')
    }

    if (admin.ativo === 0) {
      throw new Error('Administrador inativo')
    }

    const senhaValida = await bcrypt.compare(password, admin.password_hash)
    if (!senhaValida) {
      throw new Error('Credenciais inválidas')
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    )

    return { token }
  }
}
