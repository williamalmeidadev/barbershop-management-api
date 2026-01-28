import { Agendamento, StatusAgendamento, CriarAgendamentoPayload, ServicoAgendamento } from '../interfaces/agendamento'
import { servicoService } from './servicosService'
import { vagasService } from './vagasService'
import { agendamentosRepository } from '../repositories/agendamentosRepository'
import { runInTransaction } from '../repositories/transaction'
import { isIsoWithTimezone } from '../utils/validators'

export const bookingService = {
  async criarAgendamento(payload: CriarAgendamentoPayload): Promise<Agendamento> {
    if (!payload.cliente_id || !payload.barbeiro_id || !payload.inicio_desejado || !payload.servicos || !Array.isArray(payload.servicos) || payload.servicos.length === 0) {
      throw new Error('Todos os campos são obrigatórios e deve haver pelo menos um serviço.')
    }
    if (!isIsoWithTimezone(payload.inicio_desejado)) {
      throw new Error('inicio_desejado deve ser ISO 8601 com timezone (ex: 2026-01-28T12:00:00Z).')
    }
    const servicos = await servicoService.buscarPorIds(payload.servicos)
    if (servicos.length !== payload.servicos.length) {
      throw new Error('Um ou mais serviços não encontrados ou inativos')
    }
    const duracaoTotal = servicos.reduce((acc, s) => acc + s.duracao_minutos, 0)
    if (duracaoTotal <= 0) {
      throw new Error('A soma das durações dos serviços deve ser positiva.')
    }
    const valorTotal = servicos.reduce((acc, s) => acc + s.preco_centavos, 0)
    return runInTransaction(async () => {
      const vagas = await vagasService.reservarVagasParaAgendamento(
        payload.barbeiro_id,
        payload.inicio_desejado,
        duracaoTotal,
        { manageTransaction: false }
      )
      if (!vagas || vagas.length === 0) {
        throw new Error('Não há slots disponíveis para o horário e duração desejados')
      }
      const inicio = vagas[0].inicio
      const fim = vagas[vagas.length - 1].fim
      const agendamentoId = await agendamentosRepository.criarAgendamento({
        cliente_id: payload.cliente_id,
        barbeiro_id: payload.barbeiro_id,
        inicio,
        fim,
        status: StatusAgendamento.AGENDADO,
        valor_total_centavos: valorTotal
      })
      await agendamentosRepository.adicionarServicosAoAgendamento(agendamentoId, servicos)
      await agendamentosRepository.adicionarVagasAoAgendamento(agendamentoId, vagas)
      const completo = await agendamentosRepository.buscarAgendamentoCompleto(agendamentoId)
      if (!completo) {
        throw new Error('Agendamento não encontrado.')
      }
      return completo
    })
  },


  async listarAgendamentos(): Promise<Agendamento[]> {
    return agendamentosRepository.listarAgendamentosComServicosEVagas()
  },


  async cancelarAgendamento(id: number): Promise<Agendamento> {
    if (!id) throw new Error('O id do agendamento é obrigatório.')
    return runInTransaction(async () => {
      const agendamento = await agendamentosRepository.buscarAgendamentoPorId(id)
      if (!agendamento) {
        throw new Error('Agendamento não encontrado.')
      }
      if (agendamento.status === StatusAgendamento.CANCELADO) {
        throw new Error('Agendamento já cancelado.')
      }
      if (agendamento.status === StatusAgendamento.CONCLUIDO) {
        throw new Error('Agendamento já concluído.')
      }
      await agendamentosRepository.cancelarAgendamento(id)
      const atualizado = await agendamentosRepository.buscarAgendamentoCompleto(id)
      if (!atualizado) {
        throw new Error('Agendamento não encontrado.')
      }
      return atualizado
    })
  },

  async concluirAgendamento(id: number): Promise<Agendamento> {
    if (!id) throw new Error('O id do agendamento é obrigatório.')
    return runInTransaction(async () => {
      const agendamento = await agendamentosRepository.buscarAgendamentoPorId(id)
      if (!agendamento) {
        throw new Error('Agendamento não encontrado.')
      }
      if (agendamento.status === StatusAgendamento.CONCLUIDO) {
        throw new Error('Agendamento já concluído.')
      }
      if (agendamento.status === StatusAgendamento.CANCELADO) {
        throw new Error('Agendamento já cancelado.')
      }
      const concluidoEm = new Date().toISOString()
      const concluidoDate = new Date(concluidoEm)
      const inicioAgendamento = new Date(agendamento.inicio)
      const fimAgendamento = new Date(agendamento.fim)
      if (concluidoDate < inicioAgendamento) {
        throw new Error('concluido_em não pode ser antes do início do agendamento.')
      }
      if (concluidoDate < fimAgendamento) {
        const vagas = await agendamentosRepository.buscarVagasDoAgendamento(id)
        const vagasLiberar = vagas.filter(v => new Date(v.inicio) >= concluidoDate).map(v => v.id)
        if (vagasLiberar.length) {
          await vagasService.liberarVagasDoAgendamento(vagasLiberar)
        }
      }
      await agendamentosRepository.concluirAgendamento(id, concluidoEm)
      const atualizado = await agendamentosRepository.buscarAgendamentoCompleto(id)
      if (!atualizado) {
        throw new Error('Agendamento não encontrado.')
      }
      return atualizado
    })
  },
}
