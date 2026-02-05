import { EmailService } from './emailService'
import { Agendamento, StatusAgendamento, CriarAgendamentoPayload, ServicoAgendamento, PagamentoTipo } from '../interfaces/agendamento'
import { servicoService } from './servicosService'
import { vagasService } from './vagasService'
import { agendamentosRepository } from '../repositories/agendamentosRepository'
import { runInTransaction } from '../repositories/transaction'
import { isIsoWithTimezone } from '../utils/validators'
import { clientesRepository } from '../repositories/clientesRepository'
import { configuracoesRepository } from '../repositories/configuracoesRepository'
import { barbeirosService } from './barbeirosService'

const emailService = new EmailService()

export const bookingService = {
  async criarAgendamento(payload: CriarAgendamentoPayload): Promise<Agendamento> {
    if (!payload.cliente_id || !payload.barbeiro_id || !payload.inicio_desejado || !payload.servicos || !Array.isArray(payload.servicos) || payload.servicos.length === 0) {
      throw new Error('Todos os campos são obrigatórios e deve haver pelo menos um serviço.')
    }
    if (!isIsoWithTimezone(payload.inicio_desejado)) {
      throw new Error('inicio_desejado deve ser ISO 8601 com timezone (ex: 2026-01-28T12:00:00Z).')
    }
    const barbeiro = await barbeirosService.buscarPorId(payload.barbeiro_id)
    if (barbeiro.ativo !== 1) {
      throw new Error('Barbeiro indisponível para agendamento.')
    }
    const servicos = await servicoService.buscarPorIds(payload.servicos, payload.barbeiro_id)
    if (servicos.length !== payload.servicos.length) {
      throw new Error('Um ou mais serviços não encontrados, inativos ou não pertencem ao barbeiro selecionado')
    }
    const duracaoTotal = servicos.reduce((acc, s) => acc + s.duracao_minutos, 0)
    if (duracaoTotal <= 0) {
      throw new Error('A soma das durações dos serviços deve ser positiva.')
    }
    const valorTotal = servicos.reduce((acc, s) => acc + s.preco_centavos, 0)

    const agendamento = await runInTransaction(async () => {
      const cliente = await clientesRepository.findById(payload.cliente_id)
      if (!cliente) throw new Error('Cliente não encontrado.')

      if (!cliente.is_verified) {
        throw new Error('E-mail não verificado. Verifique sua caixa de entrada para ativar sua conta.')
      }

      const descontoDisponivel = cliente.desconto_disponivel_centavos ?? 0
      const descontoUsado = Math.min(valorTotal, descontoDisponivel)
      const valorComDesconto = Math.max(0, valorTotal - descontoUsado)

      const vagas = await vagasService.selecionarVagasParaAgendamento(
        payload.barbeiro_id,
        payload.inicio_desejado,
        duracaoTotal
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
        status: StatusAgendamento.SOLICITADO,
        valor_original_centavos: valorTotal,
        desconto_aplicado_centavos: descontoUsado,
        valor_total_centavos: valorComDesconto
      })
      await agendamentosRepository.adicionarServicosAoAgendamento(agendamentoId, servicos)
      await agendamentosRepository.adicionarVagasAoAgendamento(agendamentoId, vagas)
      if (descontoUsado > 0) {
        await clientesRepository.atualizarContagemEDesconto(payload.cliente_id, cliente.concluidos_count, 0)
      }
      const completo = await agendamentosRepository.buscarAgendamentoCompleto(agendamentoId)
      if (!completo) {
        throw new Error('Agendamento não encontrado.')
      }
      return completo
    })

    // Gatilho: Notifica a administração de um novo pedido
    try {
      const detalhes = `Agendamento solicitado por ${agendamento.cliente?.nome || 'ID ' + payload.cliente_id} para ${agendamento.inicio}`
      await emailService.sendAdminNotification(detalhes)
    } catch (error) {
      console.error('Erro ao notificar admin sobre novo agendamento:', error)
    }

    return agendamento
  },

  async aceitarAgendamento(id: number): Promise<Agendamento> {
    if (!id) throw new Error('O id do agendamento é obrigatório.')
    const atualizado = await runInTransaction(async () => {
      const agendamento = await agendamentosRepository.buscarAgendamentoPorId(id)
      if (!agendamento) throw new Error('Agendamento não encontrado.')

      if (agendamento.status !== StatusAgendamento.SOLICITADO) {
        throw new Error('Apenas agendamentos solicitados podem ser aceitos.')
      }
      const vagas = await agendamentosRepository.buscarVagasDoAgendamento(id)
      const ids = vagas.map(v => v.id)
      const disponiveis = await vagasService.verificarDisponiveisPorIds(ids)
      if (!disponiveis) {
        throw new Error('Não foi possível aceitar: vagas já reservadas por outro agendamento.')
      }
      await vagasService.reservarVagasPorIds(ids)
      await agendamentosRepository.atualizarStatus(id, StatusAgendamento.AGENDADO)
      const completo = await agendamentosRepository.buscarAgendamentoCompleto(id)
      if (!completo) throw new Error('Agendamento não encontrado.')
      return completo
    })

    // Gatilho: Envia confirmação real para o cliente quando o barbeiro aceita
    try {
      const cliente = await clientesRepository.findById(atualizado.cliente_id)
      if (cliente?.email) {
        await emailService.sendAppointmentConfirmation(cliente.email, cliente.nome, atualizado.inicio)
      }
    } catch (error) {
      console.error('Erro ao enviar confirmação de aceite para o cliente:', error)
    }

    return atualizado
  },

  async concluirAgendamento(id: number, pagamentoTipo: PagamentoTipo): Promise<Agendamento> {
    if (!id) throw new Error('O id do agendamento é obrigatório.')
    if (!pagamentoTipo) throw new Error('pagamento_tipo é obrigatório.')

    const atualizado = await runInTransaction(async () => {
      const agendamento = await agendamentosRepository.buscarAgendamentoPorId(id)
      if (!agendamento) throw new Error('Agendamento não encontrado.')

      if (agendamento.status === StatusAgendamento.CONCLUIDO) throw new Error('Agendamento já concluído.')

      // ... (sua lógica de validação de datas e liberação de vagas)
      const concluidoEm = new Date().toISOString()
      await agendamentosRepository.concluirAgendamento(id, concluidoEm, pagamentoTipo)

      const cliente = await clientesRepository.buscarResumo(agendamento.cliente_id)
      if (!cliente) throw new Error('Cliente não encontrado.')

      const novaContagem = cliente.concluidos_count + 1
      const qtdConcluidos = await configuracoesRepository.getInt('desconto_qtd_concluidos')
      const valorDesconto = await configuracoesRepository.getInt('desconto_valor_centavos')

      let novoDesconto = undefined
      if (qtdConcluidos && valorDesconto && novaContagem % qtdConcluidos === 0 && cliente.desconto_disponivel_centavos === 0) {
        novoDesconto = valorDesconto
      }

      await clientesRepository.atualizarContagemEDesconto(agendamento.cliente_id, novaContagem, novoDesconto)

      const completo = await agendamentosRepository.buscarAgendamentoCompleto(id)
      if (!completo) throw new Error('Agendamento não encontrado.')
      return completo
    })

    // Gatilho: Envia recibo e finalização de serviço
    try {
      const cliente = await clientesRepository.findById(atualizado.cliente_id)
      if (cliente?.email) {
        const servicoNome = atualizado.servicos?.[0]?.nome || "Serviço AlphaCuts"
        const valorFormatado = `R$ ${(atualizado.valor_total_centavos / 100).toFixed(2)}`
        await emailService.sendPaymentReceipt(cliente.email, cliente.nome, servicoNome, valorFormatado)
      }
    } catch (error) {
      console.error('Erro ao enviar recibo de pagamento:', error)
    }

    return atualizado
  },

  async listarAgendamentos(): Promise<Agendamento[]> {
    return agendamentosRepository.listarAgendamentosComServicosEVagas()
  },

  async listarAgendamentosDoCliente(clienteId: number): Promise<Agendamento[]> {
    if (!clienteId) throw new Error('Cliente ID é obrigatório.')
    return agendamentosRepository.listarAgendamentosDoCliente(clienteId)
  },


  async cancelarAgendamento(id: number, requester: { id: number; role: string }): Promise<Agendamento> {
    if (!id) throw new Error('O id do agendamento é obrigatório.')
    return runInTransaction(async () => {
      const agendamento = await agendamentosRepository.buscarAgendamentoPorId(id)
      if (!agendamento) {
        throw new Error('Agendamento não encontrado.')
      }
      if (requester.role !== 'admin' && agendamento.cliente_id !== requester.id) {
        throw new Error('Acesso negado.')
      }
      if (agendamento.status === StatusAgendamento.CANCELADO) {
        throw new Error('Agendamento já cancelado.')
      }
      if (agendamento.status === StatusAgendamento.RECUSADO) {
        throw new Error('Agendamento já recusado.')
      }
      if (agendamento.status === StatusAgendamento.CONCLUIDO) {
        throw new Error('Agendamento já concluído.')
      }
      await agendamentosRepository.cancelarAgendamento(id, agendamento.status === StatusAgendamento.AGENDADO)

      if (agendamento.desconto_aplicado_centavos > 0) {
        const cliente = await clientesRepository.buscarResumo(agendamento.cliente_id)
        if (cliente) {
          await clientesRepository.atualizarContagemEDesconto(agendamento.cliente_id, cliente.concluidos_count, agendamento.desconto_aplicado_centavos)
        }
      }

      const atualizado = await agendamentosRepository.buscarAgendamentoCompleto(id)
      if (!atualizado) {
        throw new Error('Agendamento não encontrado.')
      }
      return atualizado
    })
  },

  async recusarAgendamento(id: number): Promise<Agendamento> {
    if (!id) throw new Error('O id do agendamento é obrigatório.')
    return runInTransaction(async () => {
      const agendamento = await agendamentosRepository.buscarAgendamentoPorId(id)
      if (!agendamento) {
        throw new Error('Agendamento não encontrado.')
      }
      if (agendamento.status !== StatusAgendamento.SOLICITADO) {
        throw new Error('Apenas agendamentos solicitados podem ser recusados.')
      }
      await agendamentosRepository.atualizarStatus(id, StatusAgendamento.RECUSADO)

      if (agendamento.desconto_aplicado_centavos > 0) {
        const cliente = await clientesRepository.buscarResumo(agendamento.cliente_id)
        if (cliente) {
          await clientesRepository.atualizarContagemEDesconto(agendamento.cliente_id, cliente.concluidos_count, agendamento.desconto_aplicado_centavos)
        }
      }

      const atualizado = await agendamentosRepository.buscarAgendamentoCompleto(id)
      if (!atualizado) throw new Error('Agendamento não encontrado.')
      return atualizado
    })
  },
}
