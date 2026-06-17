import type { Booking, BookingStatus, TimeSlot } from '../../shared/types.js';
import { BaseRepository } from './BaseRepository.js';

export class BookingRepository extends BaseRepository<Booking> {
  constructor() {
    super('bookings');
  }

  protected initStatements(): void {}
  protected toModel(_row: Record<string, unknown>): Booking {
    return {} as Booking;
  }

  findByUserId(_userId: string): Booking[] {
    return [];
  }

  findByVenueId(_venueId: string): Booking[] {
    return [];
  }

  findByUserIdAndStatus(_userId: string, _status: BookingStatus): Booking[] {
    return [];
  }

  findByVenueIdAndStatus(_venueId: string, _status: BookingStatus): Booking[] {
    return [];
  }

  findByVenueIdAndDate(_venueId: string, _date: string): Booking[] {
    return [];
  }

  getUpcomingBookingsByHost(_hostId: string): Booking[] {
    return [];
  }

  getBookingsByHostAndStatus(_hostId: string, _status: BookingStatus): Booking[] {
    return [];
  }

  updateStatus(_id: string, _status: BookingStatus, _hostReply?: string): Booking | null {
    return null;
  }

  checkOverlap(_venueId: string, _date: string, _timeSlot: TimeSlot): boolean {
    return false;
  }
}

export const bookingRepository = new BookingRepository();
