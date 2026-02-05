import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { isStrongPassword, isValidEmail, PASSWORD_MIN_LENGTH } from '../utils/validators'
import { clientesRepository } from '../repositories/clientesRepository'
import { ClienteCreatePayload } from '../interfaces/cliente'
import { EmailService } from './emailService'

const emailService = new EmailService()

export const clientesService = {
  async criar(payload: ClienteCreatePayload): Promise<{ clienteId: number }> {
    const { nome, email, telefone, password } = payload

    if (!nome || !email || !password) {
      throw new Error('Nome, email e senha são obrigatórios.')
    }

    if (!isValidEmail(email)) {
      throw new Error('E-mail inválido.')
    }

    if (!isStrongPassword(password)) {
      throw new Error(`Senha fraca. Use no mínimo ${PASSWORD_MIN_LENGTH} caracteres, com letra maiúscula, minúscula e número.`)
    }

    const existente = await clientesRepository.findByEmail(email)
    if (existente) {
      throw new Error('E-mail já cadastrado.')
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const verificationToken = crypto.randomBytes(32).toString('hex')

    const clienteId = await clientesRepository.create({
      nome,
      email,
      telefone: telefone ?? null,
      password_hash: passwordHash,
      verification_token: verificationToken
    })

    try {
      await emailService.sendVerificationEmail(email, nome, verificationToken)
    } catch (error) {
      console.error('Erro ao enviar email de verificação:', error)
    }

    return { clienteId }
  },

  async verificarCadastro(token: string) {
    if (!token) throw new Error('Token inválido.')

    const cliente = await clientesRepository.findByVerificationToken(token)
    if (!cliente) {
      throw new Error('Token inválido ou expirado.')
    }

    await clientesRepository.verify(cliente.id)
    return cliente
  },

  async buscarPorId(id: number) {
    if (!id) throw new Error('Cliente ID é obrigatório.')
    return clientesRepository.findById(id)
  },
}