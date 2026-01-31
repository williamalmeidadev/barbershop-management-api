import { Request, Response } from 'express'
import { clientesService } from '../services/clientesService'

export const clientesController = {
  async criar(req: Request, res: Response) {
    try {
      const result = await clientesService.criar(req.body)
      res.status(201).json({ message: 'Cliente cadastrado com sucesso', clienteId: result.clienteId })
    } catch (err: any) {
      const status = err.message?.includes('já cadastrado') ? 409 : 400
      res.status(status).json({ error: err.message })
    }
  },

  async me(req: Request, res: Response) {
    try {
      const user = req.user
      if (!user) return res.status(401).json({ error: 'Token não fornecido.' })
      if (user.role !== 'cliente') return res.status(403).json({ error: 'Acesso negado.' })
      const cliente = await clientesService.buscarPorId(user.id)
      if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado.' })
      res.json(cliente)
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  },
}
