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
      return {
        id: agendamentoId,
        cliente_id: payload.cliente_id,
        barbeiro_id: payload.barbeiro_id,
        inicio,
        fim,
        status: StatusAgendamento.AGENDADO,
        valor_total_centavos: valorTotal,
        created_at: new Date().toISOString(),
        servicos: servicos.map(s => ({
          servico_id: s.id,
          preco_centavos: s.preco_centavos,
          duracao_minutos: s.duracao_minutos,
        })),
        vagas: vagas.map(s => s.id),
      }
    })
  },


  async listarAgendamentos(): Promise<Agendamento[]> {
    return agendamentosRepository.listarAgendamentosComServicosEVagas()
  },


  async cancelarAgendamento(id: number): Promise<void> {
    if (!id) throw new Error('O id do agendamento é obrigatório.')
    await agendamentosRepository.cancelarAgendamento(id)
  },

  async concluirAgendamento(id: number): Promise<void> {
    if (!id) throw new Error('O id do agendamento é obrigatório.')
    await agendamentosRepository.concluirAgendamento(id)
  },
}
