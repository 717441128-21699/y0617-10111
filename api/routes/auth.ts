import { Router } from 'express'
import { authController } from '../controllers/index.js'
import { authMiddleware, requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/login', authController.login)
router.post('/register', authController.register)
router.post('/logout', authController.logout)
router.get('/me', authMiddleware, requireAuth, authController.getCurrentUser)

export default router
