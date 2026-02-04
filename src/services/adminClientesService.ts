import { clientesRepository } from '../repositories/clientesRepository'
import { Cliente, ClienteUpdatePayload } from '../interfaces/cliente'
import { isValidEmail } from '../utils/validators'

export const adminClientesService = {
  async listar(ativo?: number): Promise<Cliente[]> {
    if (ativo !== undefined && ![0, 1].includes(ativo)) {
      throw new Error('Parâmetro ativo inválido. Use 0 ou 1.')
    }
    return clientesRepository.list(ativo)
  },

  async listarSimples(): Promise<Array<{ id: number; nome: string }>> {
    return clientesRepository.listSimpleAtivos()
  },

  async buscarPorId(id: number): Promise<Cliente> {
    if (!id) throw new Error('O id do cliente é obrigatório.')
    const cliente = await clientesRepository.findById(id)
    if (!cliente) throw new Error('Cliente não encontrado.')
    return cliente
  },

  async atualizar(id: number, payload: ClienteUpdatePayload): Promise<Cliente> {
    if (!id) throw new Error('O id do cliente é obrigatório.')
    if (Object.keys(payload).length === 0) {
      throw new Error('Informe ao menos um campo para atualizar.')
    }
    if (payload.ativo !== undefined && ![0, 1].includes(payload.ativo)) {
      throw new Error('Ativo deve ser 0 ou 1.')
    }
    if (payload.email !== undefined) {
      if (!isValidEmail(payload.email)) {
        throw new Error('E-mail inválido.')
      }
      const existente = await clientesRepository.findByEmailExcludingId(payload.email, id)
      if (existente) {
        throw new Error('E-mail já cadastrado.')
      }
    }
    return clientesRepository.update(id, payload)
  },

  async desativar(id: number): Promise<Cliente> {
    if (!id) throw new Error('O id do cliente é obrigatório.')
    return clientesRepository.deactivate(id)
  },

  async apagarPermanente(id: number): Promise<void> {
    if (!id) throw new Error('O id do cliente é obrigatório.')
    const cliente = await clientesRepository.findById(id)
    if (!cliente) throw new Error('Cliente não encontrado.')

    const agendamentos = await clientesRepository.countAgendamentos(id)
    if (agendamentos > 0) {
      throw new Error('Não é possível apagar cliente com agendamentos vinculados.')
    }

    try {
      await clientesRepository.remove(id)
    } catch (err: any) {
      if (String(err?.message || '').includes('FOREIGN KEY')) {
        throw new Error('Não é possível apagar cliente com vínculos ativos.')
      }
      throw err
    }
  }
}
