import { Router } from 'express'
import clienteRoutes from './clienteRoutes'
import bookingRoutes from './agendamentosRotas'
import adminRoutes from './adminRoutes'
import adminClientesRoutes from './adminClientesRoutes'
import loginClienteRoutes from './loginCliente'
import loginAdminRoutes from './loginAdmin'
import vagaRoutes from './vagasRoutes'
import servicosRoutes from './servicosRoutes'
import barbeirosRoutes from './barbeirosRoutes'
import configuracoesRoutes from './configuracoesRoutes'

import authRoutes from './authRoutes'

const routes = Router()

routes.get('/teste', (_, res) => {
  res.json({ status: 'ok' })
})

routes.use('/vagas', vagaRoutes);
routes.use('/servicos', servicosRoutes);
routes.use('/barbeiros', barbeirosRoutes);
routes.use('/configuracoes', configuracoesRoutes);
routes.use('/clientes', clienteRoutes);
routes.use('/agendamentos', bookingRoutes);
routes.use('/admins', adminRoutes);
routes.use('/admins/clientes', adminClientesRoutes);
routes.use('/auth', loginClienteRoutes);
routes.use('/auth', loginAdminRoutes);
routes.use('/auth', authRoutes);

export default routes
