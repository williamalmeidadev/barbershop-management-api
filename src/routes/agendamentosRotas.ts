import { Router } from 'express'
import { bookingController } from '../controllers/agendamentosController'

const router = Router()

router.post('/', bookingController.criar)
router.get('/', bookingController.listar)
router.post('/:id/cancelar', bookingController.cancelar)
router.post('/:id/concluir', bookingController.concluir)

export default router
