import { Request, Response } from 'express'
import { bookingService } from '../services/agendamentosService'

export const bookingController = {
  async criar(req: Request, res: Response) {
    try {
      const agendamento = await bookingService.criarAgendamento(req.body)
      res.status(201).json(agendamento)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  },

  async listar(req: Request, res: Response) {
    try {
      const agendamentos = await bookingService.listarAgendamentos()
      res.json(agendamentos)
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  },

  async cancelar(req: Request, res: Response) {
    try {
      await bookingService.cancelarAgendamento(Number(req.params.id))
      res.status(204).send()
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  },

  async concluir(req: Request, res: Response) {
    try {
      await bookingService.concluirAgendamento(Number(req.params.id))
      res.status(204).send()
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  },
}