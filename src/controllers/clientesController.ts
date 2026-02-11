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

  async getMe(req: Request, res: Response) {
    try {
      const user = req.user
      if (!user) return res.status(401).json({ error: 'Token não fornecido.' })
      if (user.role !== 'cliente') return res.status(403).json({ error: 'Acesso negado.' })
      const cliente = await clientesService.buscarPorId(Number(user.id))
      if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado.' })
      res.json(cliente)
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  },

  async updateMe(req: Request, res: Response) {
    try {
      const user = req.user
      if (!user) return res.status(401).json({ error: 'Token não fornecido.' })

      const { nome, email, telefone } = req.body
      const cliente = await clientesService.updateProfile(Number(user.id), { nome, email, telefone })
      res.json(cliente)
    } catch (err: any) {
      const status = err.message?.includes('já está em uso') ? 409 : 400
      res.status(status).json({ error: err.message })
    }
  },

  async deleteMe(req: Request, res: Response) {
    try {
      const user = req.user
      if (!user) return res.status(401).json({ error: 'Token não fornecido.' })

      await clientesService.deleteAccount(Number(user.id))
      res.status(204).send()
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  },
}
