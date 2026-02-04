import bcrypt from 'bcrypt'
import { isStrongPassword, isValidEmail, PASSWORD_MIN_LENGTH } from '../utils/validators'
import { adminsRepository } from '../repositories/adminsRepository'
import { AdminCreatePayload } from '../interfaces/admin'

export const adminsService = {
  async criar(payload: AdminCreatePayload): Promise<{ adminId: number }> {
    const { usuario, nome, email, password } = payload

    if (!usuario || !nome || !password) {
      throw new Error('Usuário, nome e senha são obrigatórios.')
    }

    if (email && !isValidEmail(email)) {
      throw new Error('E-mail inválido.')
    }

    if (!isStrongPassword(password)) {
      throw new Error(`Senha fraca. Use no mínimo ${PASSWORD_MIN_LENGTH} caracteres, com letra maiúscula, minúscula e número.`)
    }

    const existente = await adminsRepository.findByEmailOrUsuario(email ?? '', usuario)
    if (existente) {
      throw new Error('Admin já existe com esse usuário ou email')
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const adminId = await adminsRepository.create({
      usuario,
      nome,
      email: email ?? null,
      password_hash: passwordHash
    })

    return { adminId }
  }
}
