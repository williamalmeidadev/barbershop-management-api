import { Router } from 'express'
import clienteRoutes from './clienteRoutes'
import slotRoutes from './vagasRoutes'
import bookingRoutes from './agendamentosRotas'

const routes = Router()

routes.get('/teste', (_, res) => {
  res.json({ status: 'ok' })
})

routes.use('/clientes', clienteRoutes);

routes.use('/agendamentos', bookingRoutes);

routes.use('/vagas', slotRoutes);

export default routes