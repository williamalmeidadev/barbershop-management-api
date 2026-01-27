import { Router } from 'express'
import clienteRoutes from './clienteRoutes'

const routes = Router()

routes.get('/teste', (_, res) => {
  res.json({ status: 'ok' })
})

routes.use('/clientes', clienteRoutes);

export default routes