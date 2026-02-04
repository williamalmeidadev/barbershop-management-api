import { AtualizarBarbeiroPayload, Barbeiro, CriarBarbeiroPayload } from '../interfaces/barbeiro'
import { barbeirosRepository } from '../repositories/barbeirosRepository'

export const barbeirosService = {
  async criar(payload: CriarBarbeiroPayload): Promise<Barbeiro> {
    if (!payload.nome_profissional) {
      throw new Error('Nome profissional é obrigatório.')
    }
    const ativo = payload.ativo ?? 1
    if (![0, 1].includes(ativo)) {
      throw new Error('Ativo deve ser 0 ou 1.')
    }
    return barbeirosRepository.criar({
      nome_profissional: payload.nome_profissional,
      bio: payload.bio ?? null,
      foto_url: payload.foto_url ?? null,
      ativo
    })
  },

  async listar(ativo?: number): Promise<Barbeiro[]> {
    if (ativo !== undefined && ![0, 1].includes(ativo)) {
      throw new Error('Parâmetro ativo inválido. Use 0 ou 1.')
    }
    return barbeirosRepository.listar(ativo)
  },

  async buscarPorId(id: number): Promise<Barbeiro> {
    if (!id) throw new Error('O id do barbeiro é obrigatório.')
    const barbeiro = await barbeirosRepository.buscarPorId(id)
    if (!barbeiro) throw new Error('Barbeiro não encontrado.')
    return barbeiro
  },

  async atualizar(id: number, payload: AtualizarBarbeiroPayload): Promise<Barbeiro> {
    if (!id) throw new Error('O id do barbeiro é obrigatório.')
    if (Object.keys(payload).length === 0) {
      throw new Error('Informe ao menos um campo para atualizar.')
    }
    if (payload.ativo !== undefined && ![0, 1].includes(payload.ativo)) {
      throw new Error('Ativo deve ser 0 ou 1.')
    }
    return barbeirosRepository.atualizar(id, payload)
  },

  async desativar(id: number): Promise<Barbeiro> {
    if (!id) throw new Error('O id do barbeiro é obrigatório.')
    return barbeirosRepository.desativar(id)
  },

  async apagarPermanente(id: number): Promise<void> {
    if (!id) throw new Error('O id do barbeiro é obrigatório.')
    const barbeiro = await barbeirosRepository.buscarPorId(id)
    if (!barbeiro) throw new Error('Barbeiro não encontrado.')

    const deps = await barbeirosRepository.countDependencias(id)
    if (deps.servicos > 0 || deps.vagas > 0 || deps.agendamentos > 0) {
      throw new Error('Não é possível apagar barbeiro com serviços, vagas ou agendamentos vinculados.')
    }

    try {
      await barbeirosRepository.remover(id)
    } catch (err: any) {
      if (String(err?.message || '').includes('FOREIGN KEY')) {
        throw new Error('Não é possível apagar barbeiro com vínculos ativos.')
      }
      throw err
    }
  }
}
