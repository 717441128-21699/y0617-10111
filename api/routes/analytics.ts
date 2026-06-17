import { Router } from 'express'
import { analyticsController } from '../controllers/index.js'
import { authMiddleware, requireHost, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/host/analytics/booking-rate', authMiddleware, requireHost, analyticsController.getBookingRate)
router.get('/host/analytics/revenue', authMiddleware, requireHost, analyticsController.getRevenue)
router.get('/host/analytics/event-types', authMiddleware, requireHost, analyticsController.getEventTypes)
router.get('/host/analytics/overview', authMiddleware, requireHost, analyticsController.getHostOverview)
router.get('/host/analytics/monthly-revenue', authMiddleware, requireHost, analyticsController.getMonthlyRevenue)
router.get('/admin/analytics/overview', authMiddleware, requireAdmin, analyticsController.getAdminOverview)

export default router
