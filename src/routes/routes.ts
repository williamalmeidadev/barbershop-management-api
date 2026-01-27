
import { Router } from 'express'
import slotRoutes from './slotRoutes'
import clienteRoutes from './clienteRoutes'

const routes = Router()

routes.get('/teste', (_, res) => {
  res.json({ status: 'ok' })
})

routes.use(slotRoutes)

routes.use('/clientes', clienteRoutes);

export default routes