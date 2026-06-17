import type { Review, CreateReviewRequest } from '../../shared/types.js'
import { reviewRepository, bookingRepository, venueRepository } from '../repositories/index.js'

export class ReviewService {
  getReviewsByVenue(venueId: string, page: number = 1, pageSize: number = 10): { reviews: Review[]; total: number } {
    return reviewRepository.findByVenueId(venueId, page, pageSize)
  }

  getReviewById(id: string): Review | null {
    return reviewRepository.findById(id)
  }

  createReview(userId: string, request: CreateReviewRequest): Review | null {
    const booking = bookingRepository.findById(request.bookingId)
    if (!booking || booking.userId !== userId) return null
    if (booking.status !== 'completed') return null
    if (booking.venueId !== request.venueId) return null

    const existingReview = reviewRepository.findByBookingId(request.bookingId)
    if (existingReview) return null

    const review = reviewRepository.create({
      bookingId: request.bookingId,
      venueId: request.venueId,
      userId,
      rating: request.rating,
      content: request.content,
      createdAt: new Date().toISOString(),
    })

    const { reviews } = reviewRepository.findByVenueId(request.venueId, 1, 1000)
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : request.rating
    venueRepository.updateRating(request.venueId, Math.round(avgRating * 10) / 10, reviews.length)

    return review
  }

  replyToReview(id: string, hostId: string, reply: string): Review | null {
    const review = reviewRepository.findById(id)
    if (!review) return null

    const venue = venueRepository.findById(review.venueId)
    if (!venue || venue.hostId !== hostId) return null

    return reviewRepository.update(id, { hostReply: reply })
  }
}

export const reviewService = new ReviewService()
