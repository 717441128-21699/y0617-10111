import type { Booking, CreateBookingRequest, BookingStatus, SelectedService, TimeSlot, ServiceDetail, Venue } from '../../shared/types.js';
import { bookings, venues, priceConfigs, services, generateId, db } from '../persistedData.js';
import { TIME_SLOT_LABELS } from '../../shared/types.js';

const ACTIVE_STATUSES: BookingStatus[] = ['pending', 'approved', 'depositPaid', 'confirmed', 'completed'];

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function buildServicesDetail(booking: { selectedServices: SelectedService[] }, venueId: string): ServiceDetail[] {
  const result: ServiceDetail[] = [];
  for (const ss of booking.selectedServices) {
    const service = services.find((s) => s.id === ss.serviceId && s.venueId === venueId);
    if (service) {
      result.push({
        name: service.name,
        category: service.category,
        price: service.price,
        unit: service.unit,
        quantity: ss.quantity,
        subtotal: service.price * ss.quantity,
      });
    }
  }
  return result;
}

function attachVenueAndUser(booking: Booking): Booking {
  const venue = venues.find((v) => v.id === booking.venueId);
  const withDetail: Booking = {
    ...booking,
    servicesDetail: buildServicesDetail(booking, booking.venueId),
  };
  if (venue) {
    withDetail.venue = venue;
  }
  return withDetail;
}

interface ConflictResult {
  conflict: boolean;
  dateLabel?: string;
  slotLabel?: string;
}

function checkOverlap(venueId: string, date: string, timeSlot: TimeSlot, excludeBookingId?: string): ConflictResult {
  const existingBookings = bookings.filter(
    (b) =>
      b.venueId === venueId &&
      b.date === date &&
      ACTIVE_STATUSES.includes(b.status) &&
      (excludeBookingId ? b.id !== excludeBookingId : true)
  );

  for (const existing of existingBookings) {
    let isConflict = false;
    if (existing.timeSlot === 'fullDay' || timeSlot === 'fullDay') {
      isConflict = true;
    } else if (existing.timeSlot === timeSlot) {
      isConflict = true;
    }
    if (isConflict) {
      return {
        conflict: true,
        dateLabel: formatDateLabel(date),
        slotLabel: TIME_SLOT_LABELS[existing.timeSlot],
      };
    }
  }

  return { conflict: false };
}

export class BookingService {
  getBookingById(id: string): Booking | null {
    const booking = bookings.find((b) => b.id === id) || null;
    if (!booking) return null;
    return attachVenueAndUser(booking);
  }

  getBookingsByUser(userId: string, status?: BookingStatus): Booking[] {
    let result = bookings.filter((b) => b.userId === userId);
    if (status) {
      result = result.filter((b) => b.status === status);
    }
    return result.map(attachVenueAndUser);
  }

  getBookingsByHost(hostId: string, status?: BookingStatus): Booking[] {
    const hostVenueIds = new Set(venues.filter((v) => v.hostId === hostId).map((v) => v.id));
    let result = bookings.filter((b) => hostVenueIds.has(b.venueId));
    if (status) {
      result = result.filter((b) => b.status === status);
    }
    return result.map(attachVenueAndUser);
  }

  createBooking(userId: string, request: CreateBookingRequest): Booking {
    const venue = venues.find((v) => v.id === request.venueId);
    if (!venue) {
      throw new Error('场地不存在');
    }

    if (request.estimatedPeople > venue.capacity) {
      throw new Error(`预估人数(${request.estimatedPeople}人)超过场地最大容量(${venue.capacity}人)`);
    }

    const overlap = checkOverlap(request.venueId, request.date, request.timeSlot);
    if (overlap.conflict && overlap.dateLabel && overlap.slotLabel) {
      throw new Error(`该日期时段已被预订，请选择其他日期或时段。已锁定：${overlap.dateLabel} ${overlap.slotLabel}`);
    }

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
    db.write();
    return attachVenueAndUser(booking);
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
    db.write();
    return attachVenueAndUser(bookings[index]);
  }

  payDeposit(id: string, userId: string): Booking | null {
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) return null;
    if (bookings[index].userId !== userId) return null;
    if (bookings[index].status !== 'approved') {
      throw new Error('该订单状态不支持支付定金');
    }

    const booking = bookings[index];

    bookings[index] = {
      ...booking,
      status: 'depositPaid' as BookingStatus,
      hostReply: '定金已支付',
    };
    db.write();

    return attachVenueAndUser(bookings[index]);
  }

  deleteBooking(id: string, userId: string): boolean {
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) return false;
    if (bookings[index].userId !== userId) return false;
    if (!['pending', 'approved'].includes(bookings[index].status)) return false;

    bookings.splice(index, 1);
    db.write();
    return true;
  }

  getBookedSlotsByVenue(venueId: string): { date: string; timeSlot: TimeSlot }[] {
    const result: { date: string; timeSlot: TimeSlot }[] = [];
    for (const b of bookings) {
      if (b.venueId !== venueId) continue;
      if (!ACTIVE_STATUSES.includes(b.status)) continue;
      result.push({ date: b.date, timeSlot: b.timeSlot });
    }
    return result;
  }
}

export const bookingService = new BookingService();
