
import { Router } from 'express'
import slotRoutes from './slotRoutes'

const routes = Router()

routes.get('/teste', (_, res) => {
  res.json({ status: 'ok' })
})

routes.use(slotRoutes)

export default routes
