import { Request, Response } from 'express'
import { slotService } from '../services/slotService'

export const slotController = {
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

  async liberarSlotsDoAgendamento(req: Request, res: Response) {
    try {
      const { slotIds } = req.body
      const slots = await slotService.liberarSlotsDoAgendamento(slotIds)
      res.status(200).json({ liberados: slots })
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  },
}
