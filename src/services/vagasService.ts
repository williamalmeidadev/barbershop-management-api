import { Vaga, StatusVaga } from '../interfaces/vaga'
import { vagasRepository } from '../repositories/vagasRepository'
import { runInTransaction } from '../repositories/transaction'
import { isIsoWithTimezone } from '../utils/validators'

export const vagasService = {
  async listarTodas(barbeiroId: number, data: string): Promise<Vaga[]> {
    if (!barbeiroId || !data) {
      throw new Error('barbeiroId e data são obrigatórios.')
    }
    return vagasRepository.buscarTodasPorBarbeiroEData(barbeiroId, data)
  },
  async apagarVagaComValidacao(vagaId: number): Promise<{ success: boolean; message: string; vaga?: Vaga }> {
    const existeAgendamento = await vagasRepository.verificarAgendamentoNaVaga(vagaId)
    if (existeAgendamento) {
      return { success: false, message: 'Não é possível apagar: existe agendamento ocupando esta vaga.' }
    }

    const vagas = await vagasRepository.buscarVagasPorIds([vagaId])
    const vaga = vagas[0]
    const apagado = await vagasRepository.apagarVaga(vagaId)
    if (apagado && vaga) {
      return { success: true, message: 'Vaga apagada com sucesso.', vaga }
    } else {
      return { success: false, message: 'Vaga não encontrada ou já apagada.' }
    }
  },
  async listarDisponiveis(barbeiroId: number, data: string): Promise<Vaga[]> {
    if (!barbeiroId || !data) {
      throw new Error('barbeiroId e data são obrigatórios.')
    }
    const vagas = await vagasRepository.buscarDisponiveisPorBarbeiroEData(barbeiroId, data)
    const now = Date.now()
    return vagas.filter(v => new Date(v.inicio).getTime() >= now)
  },
  async gerarAgendaDoDia(barbeiroId: number, data: string, inicioExpediente: string, fimExpediente: string, duracaoVaga: number): Promise<Vaga[]> {
    // Validações
    if (!barbeiroId || !data || !inicioExpediente || !fimExpediente || !duracaoVaga) {
      throw new Error('Todos os campos são obrigatórios.')
    }
    if (duracaoVaga <= 0) {
      throw new Error('A duração da vaga deve ser positiva.')
    }
    const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/
    if (!timeRegex.test(inicioExpediente) || !timeRegex.test(fimExpediente)) {
      throw new Error('Horário inválido. Use HH:mm ou HH:mm:ss.')
    }
    const [hIni, mIni, sIni = '0'] = inicioExpediente.split(':')
    const [hFim, mFim, sFim = '0'] = fimExpediente.split(':')
    const hIniNum = Number(hIni)
    const mIniNum = Number(mIni)
    const sIniNum = Number(sIni)
    const hFimNum = Number(hFim)
    const mFimNum = Number(mFim)
    const sFimNum = Number(sFim)
    if ([hIniNum, mIniNum, sIniNum, hFimNum, mFimNum, sFimNum].some(Number.isNaN)) {
      throw new Error('Horário inválido.')
    }
    if (hIniNum > hFimNum || (hIniNum === hFimNum && (mIniNum > mFimNum || (mIniNum === mFimNum && sIniNum >= sFimNum)))) {
      throw new Error('O início do expediente deve ser antes do fim.')
    }
    return vagasRepository.criarVagasParaBarbeiro(barbeiroId, data, inicioExpediente, fimExpediente, duracaoVaga)
  },

  async buscarBlocoLivre(barbeiroId: number, horarioDesejado: string, duracaoMinutos: number): Promise<Vaga[] | null> {
    if (!barbeiroId || !horarioDesejado || !duracaoMinutos) {
      throw new Error('Todos os campos são obrigatórios.')
    }
    if (duracaoMinutos <= 0) {
      throw new Error('A duração deve ser positiva.')
    }
    if (!isIsoWithTimezone(horarioDesejado)) {
      throw new Error('horarioDesejado deve ser ISO 8601 com timezone (ex: 2026-01-28T12:00:00Z).')
    }
    const inicioDesejado = new Date(horarioDesejado)
    if (inicioDesejado.getTime() < Date.now()) {
      throw new Error('Não é possível buscar vagas no passado.')
    }
    const dataUtc = getUtcDateString(inicioDesejado)
    const vagas = await vagasRepository.buscarDisponiveisPorBarbeiroEData(barbeiroId, dataUtc)
    const vagasFiltradas = vagas.filter(s => new Date(s.inicio) >= inicioDesejado)
    let bloco: Vaga[] = []
    let soma = 0
    for (let i = 0; i < vagasFiltradas.length; i++) {
      if (bloco.length === 0) {
        bloco.push(vagasFiltradas[i])
        soma = getVagaDuration(vagasFiltradas[i])
      } else {
        const anterior = bloco[bloco.length - 1]
        if (anterior.fim === vagasFiltradas[i].inicio) {
          bloco.push(vagasFiltradas[i])
          soma += getVagaDuration(vagasFiltradas[i])
        } else {
          bloco = [vagasFiltradas[i]]
          soma = getVagaDuration(vagasFiltradas[i])
        }
      }
      if (soma >= duracaoMinutos) {
        return bloco
      }
    }
    return null
  },

  async reservarVagasParaAgendamento(
    barbeiroId: number,
    inicioDesejado: string,
    duracaoMinutos: number,
    options?: { manageTransaction?: boolean }
  ): Promise<Vaga[] | null> {
    if (!barbeiroId || !inicioDesejado || !duracaoMinutos) {
      throw new Error('Todos os campos são obrigatórios.')
    }
    if (duracaoMinutos <= 0) {
      throw new Error('A duração deve ser positiva.')
    }
    if (!isIsoWithTimezone(inicioDesejado)) {
      throw new Error('inicioDesejado deve ser ISO 8601 com timezone (ex: 2026-01-28T12:00:00Z).')
    }
    if (new Date(inicioDesejado).getTime() < Date.now()) {
      throw new Error('Não é possível reservar vagas no passado.')
    }

    const manageTransaction = options?.manageTransaction ?? true

    const reserva = async (): Promise<Vaga[] | null> => {
      const inicio = new Date(inicioDesejado)
      const fim = new Date(inicio.getTime() + duracaoMinutos * 60000)

      const dataUtc = getUtcDateString(inicio)

      const vagasDisponiveis = await vagasRepository.buscarDisponiveisPorBarbeiroEData(barbeiroId, dataUtc)

      const slotsExatos = vagasDisponiveis.filter(v => {
        const vInicio = new Date(v.inicio)
        const vFim = new Date(v.fim)
        return vInicio >= inicio && vFim <= fim
      })

      const totalMinutosEncontrados = slotsExatos.reduce((acc, v) => acc + getVagaDuration(v), 0)

      if (totalMinutosEncontrados !== duracaoMinutos) {
        return null
      }

      const ids = slotsExatos.map(s => s.id)

      const aindaDisponiveis = await vagasRepository.verificarDisponiveisPorIds(ids)
      if (!aindaDisponiveis) return null

      await vagasRepository.atualizarStatusLote(ids, StatusVaga.RESERVADO)

      return slotsExatos.map(v => ({ ...v, status: StatusVaga.RESERVADO }))
    }

    return manageTransaction ? runInTransaction(reserva) : reserva()
  },

  async listarHorariosInicioDisponiveis(
    barbeiroId: number,
    data: string,
    duracaoMinutos: number
  ): Promise<string[]> {
    if (!barbeiroId || !data || !duracaoMinutos) {
      throw new Error('barbeiroId, data e duracaoMinutos são obrigatórios.')
    }
    if (duracaoMinutos <= 0) {
      throw new Error('A duração deve ser positiva.')
    }

    const vagas = await vagasRepository.buscarDisponiveisPorBarbeiroEData(barbeiroId, data)
    const now = Date.now()
    // Filtra apenas vagas futuras
    const vagasFuturas = vagas.filter(v => new Date(v.inicio).getTime() >= now)

    // Ordena por horário (garantia adicional)
    vagasFuturas.sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime())

    const horariosDisponiveis: string[] = []

    for (let i = 0; i < vagasFuturas.length; i++) {
      const slotsNecessarios: Vaga[] = []
      let duracaoAcumulada = 0

      // Tenta montar uma cadeia de slots a partir daqui
      for (let j = i; j < vagasFuturas.length; j++) {
        const atual = vagasFuturas[j]
        const anterior = slotsNecessarios.length > 0 ? slotsNecessarios[slotsNecessarios.length - 1] : null

        // Verifica contiguidade
        if (anterior && anterior.fim !== atual.inicio) {
          break // Quebrou a sequência
        }

        slotsNecessarios.push(atual)
        duracaoAcumulada += getVagaDuration(atual)

        if (duracaoAcumulada >= duracaoMinutos) {
          // Encontrou sequência válida
          horariosDisponiveis.push(vagasFuturas[i].inicio)
          break
        }
      }
    }

    return horariosDisponiveis
  },

  async selecionarVagasParaAgendamento(
    barbeiroId: number,
    inicioDesejado: string,
    duracaoMinutos: number
  ): Promise<Vaga[] | null> {
    if (!barbeiroId || !inicioDesejado || !duracaoMinutos) {
      throw new Error('Todos os campos são obrigatórios.')
    }
    if (duracaoMinutos <= 0) {
      throw new Error('A duração deve ser positiva.')
    }
    if (!isIsoWithTimezone(inicioDesejado)) {
      throw new Error('inicioDesejado deve ser ISO 8601 com timezone (ex: 2026-01-28T12:00:00Z).')
    }
    const inicio = new Date(inicioDesejado)
    if (inicio.getTime() < Date.now()) {
      throw new Error('Não é possível reservar vagas no passado.')
    }

    const dataUtc = getUtcDateString(inicio)
    const vagasDisponiveis = await vagasRepository.buscarDisponiveisPorBarbeiroEData(barbeiroId, dataUtc)

    // Ordena
    vagasDisponiveis.sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime())

    // Encontra o índice da vaga que começa no horário desejado
    const startIndex = vagasDisponiveis.findIndex(v => new Date(v.inicio).getTime() === inicio.getTime())

    if (startIndex === -1) {
      return null // Não existe vaga começando neste horário
    }

    const slotsSelecionados: Vaga[] = []
    let duracaoAcumulada = 0

    for (let i = startIndex; i < vagasDisponiveis.length; i++) {
      const atual = vagasDisponiveis[i]
      const anterior = slotsSelecionados.length > 0 ? slotsSelecionados[slotsSelecionados.length - 1] : null

      if (anterior && anterior.fim !== atual.inicio) {
        return null // Sequência quebrada antes de completar a duração
      }

      slotsSelecionados.push(atual)
      duracaoAcumulada += getVagaDuration(atual)

      if (duracaoAcumulada >= duracaoMinutos) {
        return slotsSelecionados
      }
    }

    return null // Acabaram as vagas e não completou a duração
  },

  async bloquearHorario(barbeiroId: number, inicio: string, fim: string, motivo?: string): Promise<Vaga[]> {
    if (!barbeiroId || !inicio || !fim) {
      throw new Error('Todos os campos são obrigatórios.')
    }
    if (!isIsoWithTimezone(inicio) || !isIsoWithTimezone(fim)) {
      throw new Error('inicio e fim devem ser ISO 8601 com timezone (ex: 2026-01-28T12:00:00Z).')
    }
    const inicioDate = new Date(inicio)
    const fimDate = new Date(fim)
    if (inicioDate >= fimDate) {
      throw new Error('O início deve ser antes do fim.')
    }
    const bloqueadas = await vagasRepository.bloquearIntervalo(
      barbeiroId,
      inicioDate.toISOString(),
      fimDate.toISOString(),
      motivo
    )
    if (!bloqueadas.length) {
      throw new Error('Nenhuma vaga disponível para bloquear (todas já reservadas/bloqueadas).')
    }
    return bloqueadas
  },

  async verificarDisponiveisPorIds(ids: number[]): Promise<boolean> {
    return vagasRepository.verificarDisponiveisPorIds(ids)
  },

  async reservarVagasPorIds(ids: number[]): Promise<void> {
    if (!ids.length) return
    await vagasRepository.atualizarStatusLote(ids, StatusVaga.RESERVADO)
  },

  async liberarVagasDoAgendamento(vagaIds: number[]): Promise<Vaga[]> {
    return vagasRepository.liberarVagas(vagaIds)
  },
}

function getVagaDuration(vaga: Vaga): number {
  const inicio = new Date(vaga.inicio)
  const fim = new Date(vaga.fim)
  return (fim.getTime() - inicio.getTime()) / 60000
}

function getUtcDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}
