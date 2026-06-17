import { Router } from 'express'
import { venueController, priceConfigController, serviceController, reviewController } from '../controllers/index.js'
import { authMiddleware, requireAuth, requireHost } from '../middleware/auth.js'

const router = Router()

router.get('/', venueController.getVenues)
router.get('/my', authMiddleware, requireHost, venueController.getMyVenues)
router.get('/:id', venueController.getVenueById)
router.post('/', authMiddleware, requireHost, venueController.createVenue)
router.put('/:id', authMiddleware, requireHost, venueController.updateVenue)
router.delete('/:id', authMiddleware, requireHost, venueController.deleteVenue)

router.get('/:id/pricing', priceConfigController.getPriceConfigsByVenue)
router.post('/:id/pricing', authMiddleware, requireHost, priceConfigController.createPriceConfig)

router.get('/:id/services', serviceController.getServicesByVenue)
router.post('/:id/services', authMiddleware, requireHost, serviceController.createService)

router.get('/:id/reviews', reviewController.getReviewsByVenue)
router.get('/:id/booked-slots', venueController.getBookedSlots)

export default router
