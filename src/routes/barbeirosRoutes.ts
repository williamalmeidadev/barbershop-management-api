import { Router } from 'express'
import multer from 'multer'
import { uploadConfig } from '../config/upload'
import { barbeirosController } from '../controllers/barbeirosController'

const router = Router()
const upload = multer(uploadConfig)

router.post('/', barbeirosController.criar)
router.get('/', barbeirosController.listar)
router.get('/:id', barbeirosController.buscarPorId)
router.put('/:id', barbeirosController.atualizar)
router.delete('/:id', barbeirosController.desativar)
router.patch('/:id/foto', upload.single('foto'), barbeirosController.uploadFoto)

export default router
