
import { Router } from 'express'
import clienteRoutes from './clienteRoutes'
import adminRoutes from './adminRoutes'
import slotRoutes from './slotRoutes'

const routes = Router()

routes.get('/teste', (_, res) => {
  res.json({ status: 'ok' })
})

routes.use('/clientes/register', clienteRoutes);
routes.use('/admins', adminRoutes)
routes.use(slotRoutes)

export default routes