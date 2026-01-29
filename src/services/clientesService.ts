import bcrypt from 'bcrypt'
import { isValidEmail } from '../utils/validators'
import { clientesRepository } from '../repositories/clientesRepository'
import { ClienteCreatePayload } from '../interfaces/cliente'

export const clientesService = {
  async criar(payload: ClienteCreatePayload): Promise<{ clienteId: number }> {
    const { nome, email, telefone, password } = payload

    if (!nome || !email || !password) {
      throw new Error('Nome, email e senha são obrigatórios.')
    }

    if (!isValidEmail(email)) {
      throw new Error('E-mail inválido.')
    }

    const existente = await clientesRepository.findByEmail(email)
    if (existente) {
      throw new Error('E-mail já cadastrado.')
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const clienteId = await clientesRepository.create({
      nome,
      email,
      telefone: telefone ?? null,
      password_hash: passwordHash
    })

    return { clienteId }
  }
}
