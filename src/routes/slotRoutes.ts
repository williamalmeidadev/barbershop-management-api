
import { Router } from 'express'
import { slotController } from '../controllers/slotController'

const router = Router()

router.delete('/slots/apagar', slotController.apagarSlot)

router.post('/slots/gerar', slotController.gerarAgendaDoDia)

router.get('/slots/disponiveis', slotController.listarDisponiveis)

router.get('/slots/todos', slotController.listarTodos)

router.get('/slots/bloco-livre', slotController.buscarBlocoLivre)

router.post('/slots/reservar', slotController.reservarSlots)

router.post('/slots/bloquear', slotController.bloquearHorario)

export default router
