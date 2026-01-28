
import { Router } from 'express'
import { slotController } from '../controllers/vagasController'

const router = Router()

router.delete('/apagar', slotController.apagarSlot)

router.post('/gerar', slotController.gerarAgendaDoDia)

router.get('/disponiveis', slotController.listarDisponiveis)

router.get('/todos', slotController.listarTodos)

router.get('/bloco-livre', slotController.buscarBlocoLivre)

router.post('/reservar', slotController.reservarSlots)

router.post('/bloquear', slotController.bloquearHorario)

export default router
