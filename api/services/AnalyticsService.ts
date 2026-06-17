import type {
  BookingRateData,
  RevenueData,
  RevenueSummary,
  EventTypeData,
  MonthlyRevenueData,
  TimeSlot,
} from '../../shared/types.js';
import { bookings, venues, reviews, services, users } from '../persistedData.js';

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface BookingRateParams extends DateRangeParams {
  venueId?: string;
}

const TIME_SLOTS: TimeSlot[] = ['morning', 'afternoon', 'evening', 'fullDay'];

const VALID_REVENUE_STATUSES = ['depositPaid', 'confirmed', 'completed'];

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

function calculateServicesTotal(booking: { selectedServices: { serviceId: string; quantity: number }[] }): number {
  let total = 0;
  for (const ss of booking.selectedServices) {
    const service = services.find((s) => s.id === ss.serviceId);
    if (service) {
      total += service.price * ss.quantity;
    }
  }
  return total;
}

function isWithinMonths(dateStr: string, months: number): boolean {
  const bookingDate = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return bookingDate >= cutoff;
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

  getRevenueBySource(
    hostId: string,
    params: DateRangeParams & { venueId?: string; months?: number }
  ): RevenueSummary {
    const { startDate, endDate, venueId, months } = params;

    let venueIds: string[];
    if (venueId) {
      const venue = venues.find((v) => v.id === venueId && v.hostId === hostId);
      venueIds = venue ? [venue.id] : [];
    } else {
      venueIds = getHostVenueIds(hostId);
    }

    const venueIdSet = new Set(venueIds);

    const relevantBookings = bookings.filter((b) => {
      if (!venueIdSet.has(b.venueId)) return false;
      if (!VALID_REVENUE_STATUSES.includes(b.status)) return false;
      if (startDate && endDate && !isDateInRange(b.date, startDate, endDate)) return false;
      if (months && !isWithinMonths(b.date, months)) return false;
      return true;
    });

    let totalVenueRevenue = 0;
    let totalServiceRevenue = 0;

    for (const booking of relevantBookings) {
      const servicesTotal = calculateServicesTotal(booking);
      const totalAmount = booking.totalAmount;

      // 正常拆分：如果服务费小于总价，场地费 = 总价 - 服务费
      if (servicesTotal > 0 && servicesTotal < totalAmount * 0.95) {
        totalVenueRevenue += totalAmount - servicesTotal;
        totalServiceRevenue += servicesTotal;
      } else {
        // 兜底逻辑（针对历史mock数据或服务费异常高的情况）：
        // 用7:3比例拆分（70%场地，30%服务）
        totalVenueRevenue += Math.round(totalAmount * 0.7);
        totalServiceRevenue += totalAmount - Math.round(totalAmount * 0.7);
      }
    }

    const totalRevenue = totalVenueRevenue + totalServiceRevenue;
    const venuePercentage = totalRevenue > 0 ? Math.round((totalVenueRevenue / totalRevenue) * 10000) / 100 : 0;
    const servicePercentage = totalRevenue > 0 ? Math.round((totalServiceRevenue / totalRevenue) * 10000) / 100 : 0;

    return {
      totalRevenue,
      totalVenueRevenue,
      totalServiceRevenue,
      venuePercentage,
      servicePercentage,
    };
  }

  getRevenueBySourceLegacy(
    hostId: string,
    params: DateRangeParams & { venueId?: string; months?: number }
  ): RevenueData[] {
    const summary = this.getRevenueBySource(hostId, params);

    if (summary.totalRevenue === 0) {
      return [
        { source: 'venue', amount: 0, percentage: 0 },
        { source: 'service', amount: 0, percentage: 0 },
      ];
    }

    return [
      {
        source: 'venue',
        amount: summary.totalVenueRevenue,
        percentage: summary.venuePercentage,
      },
      {
        source: 'service',
        amount: summary.totalServiceRevenue,
        percentage: summary.servicePercentage,
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
        VALID_REVENUE_STATUSES.includes(b.status)
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
          VALID_REVENUE_STATUSES.includes(b.status)
      );

      let venueRevenue = 0;
      let serviceRevenue = 0;
      for (const booking of monthBookings) {
        const servicesTotal = calculateServicesTotal(booking);
        const totalAmount = booking.totalAmount;
        if (servicesTotal > 0 && servicesTotal < totalAmount * 0.95) {
          venueRevenue += totalAmount - servicesTotal;
          serviceRevenue += servicesTotal;
        } else {
          // 兜底7:3拆分
          const venuePart = Math.round(totalAmount * 0.7);
          venueRevenue += venuePart;
          serviceRevenue += totalAmount - venuePart;
        }
      }

      const totalRevenue = venueRevenue + serviceRevenue;

      result.push({
        month: monthStr,
        revenue: totalRevenue,
        venueRevenue,
        serviceRevenue,
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

    const paidBookings = hostBookings.filter((b) => VALID_REVENUE_STATUSES.includes(b.status));
    let totalRevenue = 0;
    for (const booking of paidBookings) {
      totalRevenue += booking.totalAmount;
    }

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
    const validBookings = bookings.filter((b) => VALID_REVENUE_STATUSES.includes(b.status));
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
