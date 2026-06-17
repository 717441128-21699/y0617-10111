import { Router } from 'express'
import { serviceController } from '../controllers/index.js'
import { authMiddleware, requireHost } from '../middleware/auth.js'

const router = Router()

router.put('/:id', authMiddleware, requireHost, serviceController.updateService)
router.delete('/:id', authMiddleware, requireHost, serviceController.deleteService)

export default router
