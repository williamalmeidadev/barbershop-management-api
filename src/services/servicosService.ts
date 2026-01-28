import { Servico } from '../interfaces/servico'
import { servicoRepository } from '../repositories/servicosRepository'

export const servicoService = {
  async buscarPorIds(ids: number[]): Promise<Servico[]> {
    return servicoRepository.findByIds(ids)
  },

  async listar(ativo?: number): Promise<Servico[]> {
    if (ativo !== undefined && ![0, 1].includes(ativo)) {
      throw new Error('Parâmetro ativo inválido. Use 0 ou 1.')
    }
    return servicoRepository.list(ativo)
  },

  async buscarPorId(id: number): Promise<Servico> {
    if (!id) throw new Error('O id do serviço é obrigatório.')
    const servico = await servicoRepository.findById(id)
    if (!servico) throw new Error('Serviço não encontrado.')
    return servico
  },

  async criar(payload: {
    nome: string
    descricao?: string | null
    duracao_minutos: number
    preco_centavos: number
    ativo?: number
  }): Promise<Servico> {
    if (!payload.nome || payload.duracao_minutos === undefined || payload.preco_centavos === undefined) {
      throw new Error('Nome, duração e preço são obrigatórios.')
    }
    if (payload.duracao_minutos <= 0) {
      throw new Error('A duração deve ser positiva.')
    }
    if (payload.preco_centavos < 0) {
      throw new Error('Preço não pode ser negativo.')
    }
    const ativo = payload.ativo ?? 1
    if (![0, 1].includes(ativo)) {
      throw new Error('Ativo deve ser 0 ou 1.')
    }
    return servicoRepository.create({
      nome: payload.nome,
      descricao: payload.descricao ?? null,
      duracao_minutos: payload.duracao_minutos,
      preco_centavos: payload.preco_centavos,
      ativo
    })
  },

  async atualizar(id: number, payload: {
    nome?: string
    descricao?: string | null
    duracao_minutos?: number
    preco_centavos?: number
    ativo?: number
  }): Promise<Servico> {
    if (!id) throw new Error('O id do serviço é obrigatório.')
    if (Object.keys(payload).length === 0) {
      throw new Error('Informe ao menos um campo para atualizar.')
    }
    if (payload.duracao_minutos !== undefined && payload.duracao_minutos <= 0) {
      throw new Error('A duração deve ser positiva.')
    }
    if (payload.preco_centavos !== undefined && payload.preco_centavos < 0) {
      throw new Error('Preço não pode ser negativo.')
    }
    if (payload.ativo !== undefined && ![0, 1].includes(payload.ativo)) {
      throw new Error('Ativo deve ser 0 ou 1.')
    }
    return servicoRepository.update(id, payload)
  },

  async desativar(id: number): Promise<Servico> {
    if (!id) throw new Error('O id do serviço é obrigatório.')
    return servicoRepository.deactivate(id)
  },
}
