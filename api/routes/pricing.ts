import { Router } from 'express'
import { priceConfigController } from '../controllers/index.js'
import { authMiddleware, requireHost } from '../middleware/auth.js'

const router = Router()

router.put('/:id', authMiddleware, requireHost, priceConfigController.updatePriceConfig)
router.delete('/:id', authMiddleware, requireHost, priceConfigController.deletePriceConfig)

export default router
