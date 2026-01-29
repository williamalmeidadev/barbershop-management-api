import { Request, Response } from 'express'
import { adminClientesService } from '../services/adminClientesService'

export const adminClientesController = {
  async listar(req: Request, res: Response) {
    try {
      const ativoParam = req.query.ativo
      const ativo = ativoParam !== undefined ? Number(ativoParam) : undefined
      const clientes = await adminClientesService.listar(ativo)
      res.json(clientes)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const cliente = await adminClientesService.buscarPorId(Number(req.params.id))
      res.json(cliente)
    } catch (err: any) {
      const status = err.message?.includes('não encontrado') ? 404 : 400
      res.status(status).json({ error: err.message })
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const cliente = await adminClientesService.atualizar(Number(req.params.id), req.body)
      res.json(cliente)
    } catch (err: any) {
      const status = err.message?.includes('não encontrado') ? 404 : err.message?.includes('já cadastrado') ? 409 : 400
      res.status(status).json({ error: err.message })
    }
  },

  async desativar(req: Request, res: Response) {
    try {
      const cliente = await adminClientesService.desativar(Number(req.params.id))
      res.json(cliente)
    } catch (err: any) {
      const status = err.message?.includes('não encontrado') ? 404 : 400
      res.status(status).json({ error: err.message })
    }
  }
}
