import type { Review } from '../../shared/types.js';
import { BaseRepository } from './BaseRepository.js';

export class ReviewRepository extends BaseRepository<Review> {
  constructor() {
    super('reviews');
  }

  protected initStatements(): void {}
  protected toModel(_row: Record<string, unknown>): Review {
    return {} as Review;
  }

  findByVenueId(_venueId: string, _page: number = 1, _pageSize: number = 10): { reviews: Review[]; total: number } {
    return { reviews: [], total: 0 };
  }

  findByUserId(_userId: string): Review[] {
    return [];
  }

  findByBookingId(_bookingId: string): Review | null {
    return null;
  }

  findByHostId(_hostId: string): Review[] {
    return [];
  }
}

export const reviewRepository = new ReviewRepository();
