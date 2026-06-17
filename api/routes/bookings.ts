import { Router } from 'express'
import { bookingController } from '../controllers/index.js'
import { authMiddleware, requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, requireAuth, bookingController.getBookings)
router.get('/:id', authMiddleware, requireAuth, bookingController.getBookingById)
router.post('/', authMiddleware, requireAuth, bookingController.createBooking)
router.put('/:id/status', authMiddleware, requireAuth, bookingController.updateBookingStatus)
router.post('/:id/pay-deposit', authMiddleware, requireAuth, bookingController.payDeposit)
router.delete('/:id', authMiddleware, requireAuth, bookingController.deleteBooking)

export default router
