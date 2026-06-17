import type { Booking, CreateBookingRequest, BookingStatus, SelectedService, TimeSlot } from '../../shared/types.js';
import { bookings, venues, priceConfigs, services, generateId } from '../inMemoryData.js';

function checkOverlap(venueId: string, date: string, timeSlot: TimeSlot): boolean {
  const existingBookings = bookings.filter(
    (b) =>
      b.venueId === venueId &&
      b.date === date &&
      b.status !== 'cancelled' &&
      b.status !== 'rejected'
  );

  for (const existing of existingBookings) {
    if (existing.timeSlot === 'fullDay' || timeSlot === 'fullDay') {
      return true;
    }
    if (existing.timeSlot === timeSlot) {
      return true;
    }
  }

  return false;
}

export class BookingService {
  getBookingById(id: string): Booking | null {
    return bookings.find((b) => b.id === id) || null;
  }

  getBookingsByUser(userId: string, status?: BookingStatus): Booking[] {
    let result = bookings.filter((b) => b.userId === userId);
    if (status) {
      result = result.filter((b) => b.status === status);
    }
    return result;
  }

  getBookingsByHost(hostId: string, status?: BookingStatus): Booking[] {
    const hostVenueIds = new Set(venues.filter((v) => v.hostId === hostId).map((v) => v.id));
    let result = bookings.filter((b) => hostVenueIds.has(b.venueId));
    if (status) {
      result = result.filter((b) => b.status === status);
    }
    return result;
  }

  createBooking(userId: string, request: CreateBookingRequest): Booking | null {
    const venue = venues.find((v) => v.id === request.venueId);
    if (!venue) return null;

    if (checkOverlap(request.venueId, request.date, request.timeSlot)) return null;

    const priceConfig = priceConfigs.find(
      (pc) =>
        pc.venueId === request.venueId &&
        pc.date === request.date &&
        pc.timeSlot === request.timeSlot
    );

    let basePrice = venue.basePrice;
    if (priceConfig) {
      basePrice = priceConfig.price;
    }

    let servicesTotal = 0;
    for (const ss of request.selectedServices) {
      const service = services.find((s) => s.id === ss.serviceId);
      if (service && service.venueId === request.venueId) {
        servicesTotal += service.price * ss.quantity;
      }
    }

    const totalAmount = basePrice + servicesTotal;
    const deposit = Math.round(totalAmount * 0.3);

    const id = generateId('booking');
    const booking: Booking = {
      id,
      venueId: request.venueId,
      userId,
      date: request.date,
      timeSlot: request.timeSlot,
      eventType: request.eventType,
      estimatedPeople: request.estimatedPeople,
      specialRequirements: request.specialRequirements,
      selectedServices: request.selectedServices as SelectedService[],
      totalAmount,
      deposit,
      status: 'pending' as BookingStatus,
      createdAt: new Date().toISOString(),
    };

    bookings.push(booking);
    return booking;
  }

  updateBookingStatus(id: string, hostId: string, status: BookingStatus, hostReply?: string): Booking | null {
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) return null;

    const venue = venues.find((v) => v.id === bookings[index].venueId);
    if (!venue || venue.hostId !== hostId) return null;

    bookings[index] = { ...bookings[index], status };
    if (hostReply) {
      bookings[index].hostReply = hostReply;
    }
    return bookings[index];
  }

  payDeposit(id: string, userId: string): Booking | null {
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) return null;
    if (bookings[index].userId !== userId) return null;
    if (bookings[index].status !== 'approved') return null;

    bookings[index] = {
      ...bookings[index],
      status: 'depositPaid' as BookingStatus,
      hostReply: '定金已支付',
    };
    return bookings[index];
  }

  deleteBooking(id: string, userId: string): boolean {
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) return false;
    if (bookings[index].userId !== userId) return false;
    if (!['pending', 'approved'].includes(bookings[index].status)) return false;

    bookings.splice(index, 1);
    return true;
  }
}

export const bookingService = new BookingService();
