    import { Slot, SlotStatus } from '../interfaces/slot'
    import { slotRepository } from '../repositories/slotRepository'

    export const slotService = {
      async listarTodos(barbeiroId: number, data: string): Promise<Slot[]> {
        return slotRepository.findTodosByBarbeiroEData(barbeiroId, data)
      },
    async listarDisponiveis(barbeiroId: number, data: string): Promise<Slot[]> {
      return slotRepository.findDisponiveisByBarbeiroEData(barbeiroId, data)
    },
  async gerarAgendaDoDia(barbeiroId: number, data: string, inicioExpediente: string, fimExpediente: string, duracaoSlot: number): Promise<Slot[]> {
    return slotRepository.createSlotsForBarbeiro(barbeiroId, data, inicioExpediente, fimExpediente, duracaoSlot)
  },

  async buscarBlocoLivre(barbeiroId: number, horarioDesejado: string, duracaoMinutos: number): Promise<Slot[] | null> {
    const slots = await slotRepository.findDisponiveisByBarbeiroEData(barbeiroId, horarioDesejado.split('T')[0])
    const inicioDesejado = new Date(horarioDesejado)
    const slotsFiltrados = slots.filter(s => new Date(s.inicio) >= inicioDesejado)
    let bloco: Slot[] = []
    let soma = 0
    for (let i = 0; i < slotsFiltrados.length; i++) {
      if (bloco.length === 0) {
        bloco.push(slotsFiltrados[i])
        soma = getSlotDuration(slotsFiltrados[i])
      } else {
        const anterior = bloco[bloco.length - 1]
        if (anterior.fim === slotsFiltrados[i].inicio) {
          bloco.push(slotsFiltrados[i])
          soma += getSlotDuration(slotsFiltrados[i])
        } else {
          bloco = [slotsFiltrados[i]]
          soma = getSlotDuration(slotsFiltrados[i])
        }
      }
      if (soma >= duracaoMinutos) {
        return bloco
      }
    }
    return null
  },

  async reservarSlotsParaAgendamento(barbeiroId: number, inicioDesejado: string, duracaoMinutos: number): Promise<Slot[] | null> {
    const slots = await slotRepository.findDisponiveisByBarbeiroEData(barbeiroId, inicioDesejado.split('T')[0])
    const inicio = new Date(inicioDesejado)
    const slotsFiltrados = slots.filter(s => new Date(s.inicio) >= inicio)
    let bloco: Slot[] = []
    let soma = 0
    for (let i = 0; i < slotsFiltrados.length; i++) {
      if (bloco.length === 0) {
        bloco.push(slotsFiltrados[i])
        soma = getSlotDuration(slotsFiltrados[i])
      } else {
        const anterior = bloco[bloco.length - 1]
        if (anterior.fim === slotsFiltrados[i].inicio) {
          bloco.push(slotsFiltrados[i])
          soma += getSlotDuration(slotsFiltrados[i])
        } else {
          bloco = [slotsFiltrados[i]]
          soma = getSlotDuration(slotsFiltrados[i])
        }
      }
      if (soma >= duracaoMinutos) {
        await slotRepository.updateStatusLote(bloco.map(s => s.id), SlotStatus.RESERVADO)
        return bloco
      }
    }
    return null
  },

  async bloquearHorario(barbeiroId: number, inicio: string, fim: string, motivo?: string): Promise<Slot[]> {
    return slotRepository.bloquearIntervalo(barbeiroId, inicio, fim)
  },

  async liberarSlotsDoAgendamento(slotIds: number[]): Promise<Slot[]> {
    return slotRepository.liberarSlots(slotIds)
  },
}

function getSlotDuration(slot: Slot): number {
  const inicio = new Date(slot.inicio)
  const fim = new Date(slot.fim)
  return (fim.getTime() - inicio.getTime()) / 60000
}
