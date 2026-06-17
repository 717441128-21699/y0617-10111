import type {
  BookingRateData,
  RevenueData,
  EventTypeData,
  MonthlyRevenueData,
  TimeSlot,
} from '../../shared/types.js';
import { bookings, venues, reviews, services, users } from '../inMemoryData.js';

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface BookingRateParams extends DateRangeParams {
  venueId?: string;
}

const TIME_SLOTS: TimeSlot[] = ['morning', 'afternoon', 'evening', 'fullDay'];

function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function getHostVenueIds(hostId: string): string[] {
  return venues.filter((v) => v.hostId === hostId).map((v) => v.id);
}

function isDateInRange(dateStr: string, start: string, end: string): boolean {
  return dateStr >= start && dateStr <= end;
}

export class AnalyticsService {
  getBookingRate(hostId: string, params: BookingRateParams): BookingRateData[] {
    const startDate = params.startDate || this.getDefaultStartDate();
    const endDate = params.endDate || this.getDefaultEndDate();

    let venueIds: string[];
    if (params.venueId) {
      const venue = venues.find((v) => v.id === params.venueId && v.hostId === hostId);
      venueIds = venue ? [venue.id] : [];
    } else {
      venueIds = getHostVenueIds(hostId);
    }

    if (venueIds.length === 0) return [];

    const dates = getDatesInRange(startDate, endDate);
    const result: BookingRateData[] = [];

    for (const date of dates) {
      const totalSlots = venueIds.length * TIME_SLOTS.length;

      let bookedSlots = 0;
      for (const venueId of venueIds) {
        const venueBookings = bookings.filter(
          (b) =>
            b.venueId === venueId &&
            b.date === date &&
            b.status !== 'cancelled' &&
            b.status !== 'rejected'
        );
        for (const booking of venueBookings) {
          if (booking.timeSlot === 'fullDay') {
            bookedSlots += 4;
          } else {
            bookedSlots += 1;
          }
        }
      }

      const rate = totalSlots > 0 ? bookedSlots / totalSlots : 0;

      result.push({
        date,
        rate: Math.round(rate * 10000) / 100,
        totalSlots,
        bookedSlots,
      });
    }

    return result;
  }

  getRevenueBySource(hostId: string, params: DateRangeParams): RevenueData[] {
    const startDate = params.startDate || this.getDefaultStartDate();
    const endDate = params.endDate || this.getDefaultEndDate();

    const venueIds = new Set(getHostVenueIds(hostId));
    const relevantBookings = bookings.filter(
      (b) =>
        venueIds.has(b.venueId) &&
        isDateInRange(b.date, startDate, endDate) &&
        b.status !== 'cancelled' &&
        b.status !== 'rejected'
    );

    let venueRevenue = 0;
    let serviceRevenue = 0;

    for (const booking of relevantBookings) {
      let bookingServicesTotal = 0;
      for (const ss of booking.selectedServices) {
        const service = services.find((s) => s.id === ss.serviceId);
        if (service) {
          bookingServicesTotal += service.price * ss.quantity;
        }
      }
      const bookingVenueTotal = booking.totalAmount - bookingServicesTotal;
      if (bookingVenueTotal > 0) {
        venueRevenue += bookingVenueTotal;
      } else {
        venueRevenue += booking.totalAmount;
      }
      serviceRevenue += bookingServicesTotal;
    }

    const total = venueRevenue + serviceRevenue;

    if (total === 0) {
      return [
        { source: 'venue', amount: 0, percentage: 0 },
        { source: 'service', amount: 0, percentage: 0 },
      ];
    }

    return [
      {
        source: 'venue',
        amount: venueRevenue,
        percentage: Math.round((venueRevenue / total) * 10000) / 100,
      },
      {
        source: 'service',
        amount: serviceRevenue,
        percentage: Math.round((serviceRevenue / total) * 10000) / 100,
      },
    ];
  }

  getEventTypeDistribution(hostId: string, params: DateRangeParams): EventTypeData[] {
    const startDate = params.startDate || this.getDefaultStartDate();
    const endDate = params.endDate || this.getDefaultEndDate();

    const venueIds = new Set(getHostVenueIds(hostId));
    const relevantBookings = bookings.filter(
      (b) =>
        venueIds.has(b.venueId) &&
        isDateInRange(b.date, startDate, endDate) &&
        b.status !== 'cancelled' &&
        b.status !== 'rejected'
    );

    const countMap = new Map<string, number>();
    for (const booking of relevantBookings) {
      countMap.set(booking.eventType, (countMap.get(booking.eventType) || 0) + 1);
    }

    const total = relevantBookings.length;
    const result: EventTypeData[] = [];

    for (const [type, count] of countMap) {
      result.push({
        type,
        count,
        percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
      });
    }

    result.sort((a, b) => b.count - a.count);
    return result;
  }

  getMonthlyRevenue(hostId: string, year?: number): MonthlyRevenueData[] {
    const targetYear = year || new Date().getFullYear();
    const venueIds = new Set(getHostVenueIds(hostId));

    const result: MonthlyRevenueData[] = [];
    for (let month = 0; month < 12; month++) {
      const monthStr = `${targetYear}-${String(month + 1).padStart(2, '0')}`;
      const monthBookings = bookings.filter(
        (b) =>
          venueIds.has(b.venueId) &&
          b.date.startsWith(monthStr) &&
          b.status !== 'cancelled' &&
          b.status !== 'rejected'
      );

      const revenue = monthBookings.reduce((sum, b) => sum + b.totalAmount, 0);
      result.push({
        month: monthStr,
        revenue,
        bookings: monthBookings.length,
      });
    }

    return result;
  }

  getHostOverview(hostId: string): {
    totalVenues: number;
    totalBookings: number;
    totalRevenue: number;
    pendingBookings: number;
    avgRating: number;
  } {
    const hostVenues = venues.filter((v) => v.hostId === hostId);
    const venueIds = new Set(hostVenues.map((v) => v.id));
    const hostBookings = bookings.filter(
      (b) =>
        venueIds.has(b.venueId) &&
        b.status !== 'cancelled' &&
        b.status !== 'rejected'
    );

    const totalRevenue = hostBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const pendingBookings = hostBookings.filter((b) => b.status === 'pending').length;

    const venueReviews = reviews.filter((r) => venueIds.has(r.venueId));
    const avgRating = venueReviews.length > 0
      ? Math.round((venueReviews.reduce((sum, r) => sum + r.rating, 0) / venueReviews.length) * 10) / 10
      : 0;

    return {
      totalVenues: hostVenues.length,
      totalBookings: hostBookings.length,
      totalRevenue,
      pendingBookings,
      avgRating,
    };
  }

  getAdminOverview(): {
    totalUsers: number;
    totalVenues: number;
    totalBookings: number;
    totalRevenue: number;
    pendingVenues: number;
    pendingBookings: number;
  } {
    const validBookings = bookings.filter(
      (b) => b.status !== 'cancelled' && b.status !== 'rejected'
    );
    const totalRevenue = validBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    return {
      totalUsers: users.length,
      totalVenues: venues.length,
      totalBookings: validBookings.length,
      totalRevenue,
      pendingVenues: venues.filter((v) => v.status === 'pending').length,
      pendingBookings: bookings.filter((b) => b.status === 'pending').length,
    };
  }

  private getDefaultStartDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  }

  private getDefaultEndDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}

export const analyticsService = new AnalyticsService();
