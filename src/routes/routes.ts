import { Router } from 'express'
import clienteRoutes from './clienteRoutes'
import bookingRoutes from './agendamentosRotas'
import adminRoutes from './adminRoutes'
import loginClienteRoutes from './loginCliente'
import loginAdminRoutes from './loginAdmin'
import vagaRoutes from './vagasRoutes'
import servicosRoutes from './servicosRoutes'
import barbeirosRoutes from './barbeirosRoutes'
import { AuthController } from '../controllers/authController'

const routes = Router()
const authController = new AuthController()

routes.get('/teste', (_, res) => {
  res.json({ status: 'ok' })
})

routes.use('/vagas', vagaRoutes);
routes.use('/servicos', servicosRoutes);
routes.use('/barbeiros', barbeirosRoutes);
routes.use('/clientes', clienteRoutes);
routes.use('/agendamentos', bookingRoutes);
routes.post('/login', authController.login.bind(authController))
routes.use('/clientes/register', clienteRoutes);
routes.use('/admins', adminRoutes);
routes.use('/auth', loginClienteRoutes);
routes.use('/auth', loginAdminRoutes);

export default routes
