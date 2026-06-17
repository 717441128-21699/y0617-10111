import { Router } from 'express'
import { reviewController } from '../controllers/index.js'
import { authMiddleware, requireAuth, requireHost } from '../middleware/auth.js'

const router = Router()

router.post('/', authMiddleware, requireAuth, reviewController.createReview)
router.put('/:id/reply', authMiddleware, requireHost, reviewController.replyToReview)

export default router
