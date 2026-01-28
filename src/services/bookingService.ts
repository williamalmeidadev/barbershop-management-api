import { Booking, BookingStatus, CreateBookingPayload, BookingService } from '../interfaces/booking'
import { servicoService } from './servicoService'
import { slotService } from './slotService'
import { bookingRepository } from '../repositories/bookingRepository'

export const bookingService = {
  async criarAgendamento(payload: CreateBookingPayload): Promise<Booking> {
    if (!payload.cliente_id || !payload.barbeiro_id || !payload.inicio_desejado || !payload.servicos || !Array.isArray(payload.servicos) || payload.servicos.length === 0) {
      throw new Error('Todos os campos são obrigatórios e deve haver pelo menos um serviço.')
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
    const slots = await slotService.reservarSlotsParaAgendamento(
      payload.barbeiro_id,
      payload.inicio_desejado,
      duracaoTotal
    )
    if (!slots || slots.length === 0) {
      throw new Error('Não há slots disponíveis para o horário e duração desejados')
    }
    const inicio = slots[0].inicio
    const fim = slots[slots.length - 1].fim
    const agendamentoId = await bookingRepository.criarAgendamento({
      cliente_id: payload.cliente_id,
      barbeiro_id: payload.barbeiro_id,
      inicio,
      fim,
      status: BookingStatus.AGENDADO,
      valor_total_centavos: valorTotal
    })
    await bookingRepository.adicionarServicosAoAgendamento(agendamentoId, servicos)
    await bookingRepository.adicionarSlotsAoAgendamento(agendamentoId, slots)
    return {
      id: agendamentoId,
      cliente_id: payload.cliente_id,
      barbeiro_id: payload.barbeiro_id,
      inicio,
      fim,
      status: BookingStatus.AGENDADO,
      valor_total_centavos: valorTotal,
      created_at: new Date().toISOString(),
      servicos: servicos.map(s => ({
        servico_id: s.id,
        preco_centavos: s.preco_centavos,
        duracao_minutos: s.duracao_minutos,
      })),
      slots: slots.map(s => s.id),
    }
  },


  async listarAgendamentos(): Promise<Booking[]> {
    return bookingRepository.listarAgendamentosComServicosESlots()
  },


  async cancelarAgendamento(id: number): Promise<void> {
    if (!id) throw new Error('O id do agendamento é obrigatório.')
    await bookingRepository.cancelarAgendamento(id)
  },

  async concluirAgendamento(id: number): Promise<void> {
    if (!id) throw new Error('O id do agendamento é obrigatório.')
    await bookingRepository.concluirAgendamento(id)
  },
}
