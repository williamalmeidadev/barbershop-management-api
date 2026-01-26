import { Router } from 'express'

const routes = Router()

routes.get('/teste', (_, res) => {
  res.json({ status: 'ok' })
})

export default routes
