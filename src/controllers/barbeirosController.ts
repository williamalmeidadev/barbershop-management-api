import { Request, Response } from 'express'
import { barbeirosService } from '../services/barbeirosService'

export const barbeirosController = {
  async criar(req: Request, res: Response) {
    try {
      const barbeiro = await barbeirosService.criar(req.body)
      res.status(201).json(barbeiro)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  },

  async listar(req: Request, res: Response) {
    try {
      const ativoParam = req.query.ativo
      const ativo = ativoParam !== undefined ? Number(ativoParam) : undefined
      const barbeiros = await barbeirosService.listar(ativo)
      res.json(barbeiros)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const barbeiro = await barbeirosService.buscarPorId(Number(req.params.id))
      res.json(barbeiro)
    } catch (err: any) {
      const status = err.message?.includes('não encontrado') ? 404 : 400
      res.status(status).json({ error: err.message })
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const barbeiro = await barbeirosService.atualizar(Number(req.params.id), req.body)
      res.json(barbeiro)
    } catch (err: any) {
      const status = err.message?.includes('não encontrado') ? 404 : 400
      res.status(status).json({ error: err.message })
    }
  },

  async desativar(req: Request, res: Response) {
    try {
      const barbeiro = await barbeirosService.desativar(Number(req.params.id))
      res.json(barbeiro)
    } catch (err: any) {
      const status = err.message?.includes('não encontrado') ? 404 : 400
      res.status(status).json({ error: err.message })
    }
  }
}
