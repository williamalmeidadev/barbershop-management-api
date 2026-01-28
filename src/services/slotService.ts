import { Slot, SlotStatus } from '../interfaces/slot'
import { slotRepository } from '../repositories/slotRepository'

export const slotService = {
  async listarTodos(barbeiroId: number, data: string): Promise<Slot[]> {
    if (!barbeiroId || !data) {
      throw new Error('barbeiroId e data são obrigatórios.')
    }
    return slotRepository.findTodosByBarbeiroEData(barbeiroId, data)
  },
  async apagarSlotComValidacao(slotId: number): Promise<{ success: boolean; message: string; slot?: Slot }> {
    const existeAgendamento = await slotRepository.verificarAgendamentoNoSlot(slotId)
    if (existeAgendamento) {
      return { success: false, message: 'Não é possível apagar: existe agendamento ocupando este slot.' }
    }

    const slots = await slotRepository.findSlotsByIds([slotId])
    const slot = slots[0]
    const apagado = await slotRepository.apagarSlot(slotId)
    if (apagado && slot) {
      return { success: true, message: 'Slot apagado com sucesso.', slot }
    } else {
      return { success: false, message: 'Slot não encontrado ou já apagado.' }
    }
  },
  async listarDisponiveis(barbeiroId: number, data: string): Promise<Slot[]> {
    if (!barbeiroId || !data) {
      throw new Error('barbeiroId e data são obrigatórios.')
    }
    return slotRepository.findDisponiveisByBarbeiroEData(barbeiroId, data)
  },
  async gerarAgendaDoDia(barbeiroId: number, data: string, inicioExpediente: string, fimExpediente: string, duracaoSlot: number): Promise<Slot[]> {
    // Validações
    if (!barbeiroId || !data || !inicioExpediente || !fimExpediente || !duracaoSlot) {
      throw new Error('Todos os campos são obrigatórios.')
    }
    if (duracaoSlot <= 0) {
      throw new Error('A duração do slot deve ser positiva.')
    }
    const [hIni, mIni] = inicioExpediente.split(':').map(Number)
    const [hFim, mFim] = fimExpediente.split(':').map(Number)
    if (hIni > hFim || (hIni === hFim && mIni >= mFim)) {
      throw new Error('O início do expediente deve ser antes do fim.')
    }
    return slotRepository.createSlotsForBarbeiro(barbeiroId, data, inicioExpediente, fimExpediente, duracaoSlot)
  },

  async buscarBlocoLivre(barbeiroId: number, horarioDesejado: string, duracaoMinutos: number): Promise<Slot[] | null> {
    if (!barbeiroId || !horarioDesejado || !duracaoMinutos) {
      throw new Error('Todos os campos são obrigatórios.')
    }
    if (duracaoMinutos <= 0) {
      throw new Error('A duração deve ser positiva.')
    }
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
    // Validações
    if (!barbeiroId || !inicioDesejado || !duracaoMinutos) {
      throw new Error('Todos os campos são obrigatórios.')
    }
    if (duracaoMinutos <= 0) {
      throw new Error('A duração deve ser positiva.')
    }
    // Início da transação
    const sqlite3 = require('sqlite3')
    const db = require('../database/sqlite').db
    return await new Promise<Slot[] | null>((resolve, reject) => {
      db.serialize(async () => {
        db.run('BEGIN TRANSACTION')
        try {
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
                if (soma > 0 && soma < duracaoMinutos) {
                  db.run('ROLLBACK')
                  return resolve(null)
                }
                bloco = [slotsFiltrados[i]]
                soma = getSlotDuration(slotsFiltrados[i])
              }
            }
            if (soma >= duracaoMinutos) {
              const ids = bloco.map(s => s.id)
              db.all(
                `SELECT id FROM vagas WHERE id IN (${ids.map(() => '?').join(',')}) AND status = 'DISPONIVEL'`,
                ids,
                async (err: any, rows: any[]) => {
                  if (err) {
                    db.run('ROLLBACK')
                    return reject(err)
                  }
                  if (rows.length !== ids.length) {
                    db.run('ROLLBACK')
                    return resolve(null)
                  }
                  await slotRepository.updateStatusLote(ids, SlotStatus.RESERVADO)
                  db.run('COMMIT')
                  return resolve(bloco)
                }
              )
              return
            }
          }
          db.run('ROLLBACK')
          return resolve(null)
        } catch (err) {
          db.run('ROLLBACK')
          return reject(err)
        }
      })
    })
  },

  async bloquearHorario(barbeiroId: number, inicio: string, fim: string, motivo?: string): Promise<Slot[]> {
    if (!barbeiroId || !inicio || !fim) {
      throw new Error('Todos os campos são obrigatórios.')
    }
    if (new Date(inicio) >= new Date(fim)) {
      throw new Error('O início deve ser antes do fim.')
    }
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
