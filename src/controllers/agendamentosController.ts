import { Request, Response } from 'express'
import { bookingService } from '../services/agendamentosService'

export const bookingController = {
  async criar(req: Request, res: Response) {
    try {
      const payload = { ...req.body }
      const user = req.user
      if (user?.role === 'cliente') {
        payload.cliente_id = user.id
      }
      const agendamento = await bookingService.criarAgendamento(payload)
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

  async listarMe(req: Request, res: Response) {
    try {
      const user = req.user
      if (!user) return res.status(401).json({ error: 'Token não fornecido.' })
      if (user.role !== 'cliente') return res.status(403).json({ error: 'Acesso negado.' })
      const agendamentos = await bookingService.listarAgendamentosDoCliente(user.id)
      res.json(agendamentos)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  },

  async listarPorCliente(req: Request, res: Response) {
    try {
      const clienteId = Number(req.params.id)
      const user = req.user
      if (user?.role !== 'admin' && user?.id !== clienteId) {
        return res.status(403).json({ error: 'Acesso negado.' })
      }
      const agendamentos = await bookingService.listarAgendamentosDoCliente(clienteId)
      res.json(agendamentos)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  },

  async cancelar(req: Request, res: Response) {
    try {
      const user = req.user
      if (!user) return res.status(401).json({ error: 'Token não fornecido.' })
      const agendamento = await bookingService.cancelarAgendamento(Number(req.params.id), user)
      res.status(200).json(agendamento)
    } catch (err: any) {
      const status =
        err.message?.includes('não encontrado') ? 404 :
          err.message?.includes('já') ? 409 :
            err.message?.includes('Acesso negado') ? 403 :
              400
      res.status(status).json({ error: err.message })
    }
  },

  async aceitar(req: Request, res: Response) {
    try {
      const agendamento = await bookingService.aceitarAgendamento(Number(req.params.id))
      res.status(200).json(agendamento)
    } catch (err: any) {
      const status =
        err.message?.includes('não encontrado') ? 404 :
          err.message?.includes('vagas') ? 409 :
            err.message?.includes('aceitos') ? 409 :
              400
      res.status(status).json({ error: err.message })
    }
  },

  async recusar(req: Request, res: Response) {
    try {
      const agendamento = await bookingService.recusarAgendamento(Number(req.params.id))
      res.status(200).json(agendamento)
    } catch (err: any) {
      const status =
        err.message?.includes('não encontrado') ? 404 :
          err.message?.includes('recusados') ? 409 :
            400
      res.status(status).json({ error: err.message })
    }
  },

  async concluir(req: Request, res: Response) {
    try {
      const { pagamento_tipo } = req.body
      const agendamento = await bookingService.concluirAgendamento(Number(req.params.id), pagamento_tipo)
      res.status(200).json(agendamento)
    } catch (err: any) {
      const status =
        err.message?.includes('não encontrado') ? 404 :
          err.message?.includes('já') ? 409 :
            err.message?.includes('pagamento_tipo') ? 400 :
            400
      res.status(status).json({ error: err.message })
    }
  },
}
