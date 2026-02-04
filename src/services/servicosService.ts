import { Servico } from '../interfaces/servico'
import { servicoRepository } from '../repositories/servicosRepository'

export const servicoService = {
  async buscarPorIds(ids: number[], barbeiroId?: number): Promise<Servico[]> {
    return servicoRepository.findByIds(ids, barbeiroId)
  },

  async listar(ativo?: number, barbeiroId?: number): Promise<Servico[]> {
    if (ativo !== undefined && ![0, 1].includes(ativo)) {
      throw new Error('Parâmetro ativo inválido. Use 0 ou 1.')
    }
    if (barbeiroId !== undefined && barbeiroId <= 0) {
      throw new Error('Parâmetro barbeiro_id inválido.')
    }
    return servicoRepository.list(ativo, barbeiroId)
  },

  async buscarPorId(id: number): Promise<Servico> {
    if (!id) throw new Error('O id do serviço é obrigatório.')
    const servico = await servicoRepository.findById(id)
    if (!servico) throw new Error('Serviço não encontrado.')
    return servico
  },

  async criar(payload: {
    barbeiro_id: number
    nome: string
    descricao?: string | null
    duracao_minutos: number
    preco_centavos: number
    foto_url?: string | null
    ativo?: number
  }): Promise<Servico> {
    if (!payload.barbeiro_id) {
      throw new Error('Barbeiro é obrigatório.')
    }
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
      barbeiro_id: payload.barbeiro_id,
      nome: payload.nome,
      descricao: payload.descricao ?? null,
      duracao_minutos: payload.duracao_minutos,
      preco_centavos: payload.preco_centavos,
      foto_url: payload.foto_url ?? null,
      ativo
    })
  },

  async atualizar(id: number, payload: {
    barbeiro_id?: number
    nome?: string
    descricao?: string | null
    duracao_minutos?: number
    preco_centavos?: number
    foto_url?: string | null
    ativo?: number
  }): Promise<Servico> {
    if (!id) throw new Error('O id do serviço é obrigatório.')
    if (Object.keys(payload).length === 0) {
      throw new Error('Informe ao menos um campo para atualizar.')
    }
    if (payload.barbeiro_id !== undefined && payload.barbeiro_id <= 0) {
      throw new Error('Barbeiro inválido.')
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

  async apagarPermanente(id: number): Promise<void> {
    if (!id) throw new Error('O id do serviço é obrigatório.')
    const existente = await servicoRepository.findById(id)
    if (!existente) throw new Error('Serviço não encontrado.')

    const referencias = await servicoRepository.countAgendamentoReferencias(id)
    if (referencias > 0) {
      throw new Error('Não é possível apagar serviço com agendamentos vinculados.')
    }

    try {
      await servicoRepository.remove(id)
    } catch (err: any) {
      if (String(err?.message || '').includes('FOREIGN KEY')) {
        throw new Error('Não é possível apagar serviço com vínculos ativos.')
      }
      throw err
    }
  },
}
