import { Request, Response } from 'express'
import { slotService } from '../services/slotService'

export const slotController = {
  async apagarSlot(req: Request, res: Response) {
    try {
      const { slotId } = req.body
      if (!slotId) return res.status(400).json({ error: 'slotId é obrigatório.' })
      const result = await slotService.apagarSlotComValidacao(slotId)
      if (result.success) {
        return res.status(200).json({ message: 'Slot apagado com sucesso.', slot: result.slot })
      } else {
        return res.status(409).json({ error: result.message })
      }
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  },
  async listarTodos(req: Request, res: Response) {
    try {
      const { barbeiroId, data } = req.query
      const slots = await slotService.listarTodos(Number(barbeiroId), String(data))
      res.json(slots)
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  },
  async gerarAgendaDoDia(req: Request, res: Response) {
    try {
      const { barbeiroId, data, inicioExpediente, fimExpediente, duracaoSlot } = req.body
      const slots = await slotService.gerarAgendaDoDia(barbeiroId, data, inicioExpediente, fimExpediente, duracaoSlot)
      res.status(201).json(slots)
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  },

  async listarDisponiveis(req: Request, res: Response) {
    try {
      const { barbeiroId, data } = req.query
      const slots = await slotService.listarDisponiveis(Number(barbeiroId), String(data))
      res.json(slots)
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  },

  async buscarBlocoLivre(req: Request, res: Response) {
    try {
      const { barbeiroId, horarioDesejado, duracaoMinutos } = req.query
      const bloco = await slotService.buscarBlocoLivre(
        Number(barbeiroId),
        String(horarioDesejado),
        Number(duracaoMinutos)
      )
      res.json(bloco)
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  },

  async reservarSlots(req: Request, res: Response) {
    try {
      const { barbeiroId, inicioDesejado, duracaoMinutos } = req.body
      const bloco = await slotService.reservarSlotsParaAgendamento(
        barbeiroId,
        inicioDesejado,
        duracaoMinutos
      )
      if (!bloco) return res.status(409).json({ error: 'Não há slots disponíveis suficientes.' })
      res.status(200).json(bloco)
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  },

  async bloquearHorario(req: Request, res: Response) {
    try {
      const { barbeiroId, inicio, fim, motivo } = req.body
      const slots = await slotService.bloquearHorario(barbeiroId, inicio, fim, motivo)
      res.status(200).json({ bloqueados: slots })
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  },

}
