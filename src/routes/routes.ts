import { Router } from 'express'
import clienteRoutes from './clienteRoutes'
import adminRoutes from './adminRoutes'
import loginClienteRoutes from './loginCliente'
import loginAdminRoutes from './loginAdmin'
import slotRoutes from './slotRoutes'
import { BookingController } from '../controllers/bookingController'
import { AuthController } from '../controllers/authController'

const routes = Router()
const bookingController = new BookingController()
const authController = new AuthController()

routes.get('/teste', (_, res) => {
  res.json({ status: 'ok' })
})
routes.post('/login', authController.login.bind(authController))
routes.get('/my-activities', bookingController.myActivities.bind(bookingController))
routes.post('/activities/:id/enroll', bookingController.enroll.bind(bookingController))
routes.delete('/activities/:id/enroll', bookingController.cancel.bind(bookingController))
routes.use('/clientes/register', clienteRoutes);
routes.use('/admins', adminRoutes);
routes.use('/auth', loginClienteRoutes);
routes.use('/auth', loginAdminRoutes);
routes.use(slotRoutes)

export default routes