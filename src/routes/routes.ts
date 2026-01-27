
import { Router } from 'express'
import clienteRoutes from './clienteRoutes'
import slotRoutes from './slotRoutes'

const routes = Router()

routes.get('/teste', (_, res) => {
  res.json({ status: 'ok' })
})

routes.use('/clientes', clienteRoutes);

routes.use(slotRoutes)

export default routes
