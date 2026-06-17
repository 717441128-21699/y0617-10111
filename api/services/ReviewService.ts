import type { Review, CreateReviewRequest } from '../../shared/types.js';
import { reviews, bookings, venues, generateId, db } from '../persistedData.js';

export class ReviewService {
  getReviewsByVenue(venueId: string, page: number = 1, pageSize: number = 10): { reviews: Review[]; total: number } {
    const result = reviews.filter((r) => r.venueId === venueId);
    const total = result.length;
    const start = (page - 1) * pageSize;
    const pagedResult = result.slice(start, start + pageSize);
    return { reviews: pagedResult, total };
  }

  getReviewById(id: string): Review | null {
    return reviews.find((r) => r.id === id) || null;
  }

  createReview(userId: string, request: CreateReviewRequest): Review | null {
    const booking = bookings.find((b) => b.id === request.bookingId);
    if (!booking || booking.userId !== userId) return null;
    if (booking.status !== 'completed') return null;
    if (booking.venueId !== request.venueId) return null;

    const existingReview = reviews.find((r) => r.bookingId === request.bookingId);
    if (existingReview) return null;

    const id = generateId('review');
    const review: Review = {
      id,
      bookingId: request.bookingId,
      venueId: request.venueId,
      userId,
      rating: request.rating,
      content: request.content,
      createdAt: new Date().toISOString(),
    };

    reviews.push(review);

    const venueReviews = reviews.filter((r) => r.venueId === request.venueId);
    const avgRating = venueReviews.length > 0
      ? venueReviews.reduce((sum, r) => sum + r.rating, 0) / venueReviews.length
      : request.rating;

    const venueIndex = venues.findIndex((v) => v.id === request.venueId);
    if (venueIndex !== -1) {
      venues[venueIndex] = {
        ...venues[venueIndex],
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: venueReviews.length,
      };
    }

    return review;
  }

  replyToReview(id: string, hostId: string, reply: string): Review | null {
    const index = reviews.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const venue = venues.find((v) => v.id === reviews[index].venueId);
    if (!venue || venue.hostId !== hostId) return null;

    reviews[index] = { ...reviews[index], hostReply: reply };
    db.write();
    return reviews[index];
  }
}

export const reviewService = new ReviewService();
