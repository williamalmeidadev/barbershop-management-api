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
  }
}
