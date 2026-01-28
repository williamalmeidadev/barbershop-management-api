import { Request, Response } from 'express'
import { servicoService } from '../services/servicosService'

export const servicosController = {
  async criar(req: Request, res: Response) {
    try {
      const servico = await servicoService.criar(req.body)
      res.status(201).json(servico)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  },

  async listar(req: Request, res: Response) {
    try {
      const ativoParam = req.query.ativo
      const ativo = ativoParam !== undefined ? Number(ativoParam) : undefined
      const servicos = await servicoService.listar(ativo)
      res.json(servicos)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const servico = await servicoService.buscarPorId(Number(req.params.id))
      res.json(servico)
    } catch (err: any) {
      const status = err.message?.includes('não encontrado') ? 404 : 400
      res.status(status).json({ error: err.message })
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const servico = await servicoService.atualizar(Number(req.params.id), req.body)
      res.json(servico)
    } catch (err: any) {
      const status = err.message?.includes('não encontrado') ? 404 : 400
      res.status(status).json({ error: err.message })
    }
  },

  async desativar(req: Request, res: Response) {
    try {
      const servico = await servicoService.desativar(Number(req.params.id))
      res.json(servico)
    } catch (err: any) {
      const status = err.message?.includes('não encontrado') ? 404 : 400
      res.status(status).json({ error: err.message })
    }
  }
}
