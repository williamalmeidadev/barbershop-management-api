import { Router } from 'express'
import clienteRoutes from './clienteRoutes'
import adminRoutes from './adminRoutes'
import slotRoutes from './slotRoutes'
import { BookingController } from '../controllers/bookingController'

const routes = Router()
const bookingController = new BookingController()

routes.get('/teste', (_, res) => {
  res.json({ status: 'ok' })
})

routes.post('/activities/:id/enroll', bookingController.enroll.bind(bookingController))
routes.use('/clientes/register', clienteRoutes);
routes.use('/admins', adminRoutes)
routes.use(slotRoutes)

export default routes