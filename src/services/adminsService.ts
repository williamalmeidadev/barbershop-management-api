import bcrypt from 'bcrypt'
import { isValidEmail } from '../utils/validators'
import { adminsRepository } from '../repositories/adminsRepository'

export const adminsService = {
  async criar(payload: { usuario: string; nome: string; email?: string; password: string }): Promise<{ adminId: number }> {
    const { usuario, nome, email, password } = payload

    if (!usuario || !nome || !password) {
      throw new Error('Usuário, nome e senha são obrigatórios.')
    }

    if (email && !isValidEmail(email)) {
      throw new Error('E-mail inválido.')
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
