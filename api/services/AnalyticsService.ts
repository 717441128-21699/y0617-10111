import type {
  BookingRateData,
  RevenueData,
  EventTypeData,
  MonthlyRevenueData,
} from '../../shared/types.js'
import { analyticsRepository } from '../repositories/index.js'

export interface DateRangeParams {
  startDate?: string
  endDate?: string
}

export interface BookingRateParams extends DateRangeParams {
  venueId?: string
}

export class AnalyticsService {
  getBookingRate(hostId: string, params: BookingRateParams): BookingRateData[] {
    const startDate = params.startDate || this.getDefaultStartDate()
    const endDate = params.endDate || this.getDefaultEndDate()

    if (params.venueId) {
      return analyticsRepository.getBookingRateByVenue(params.venueId, startDate, endDate)
    }
    return analyticsRepository.getBookingRateByHost(hostId, startDate, endDate)
  }

  getRevenueBySource(hostId: string, params: DateRangeParams): RevenueData[] {
    const startDate = params.startDate || this.getDefaultStartDate()
    const endDate = params.endDate || this.getDefaultEndDate()
    return analyticsRepository.getRevenueBySource(hostId, startDate, endDate)
  }

  getEventTypeDistribution(hostId: string, params: DateRangeParams): EventTypeData[] {
    const startDate = params.startDate || this.getDefaultStartDate()
    const endDate = params.endDate || this.getDefaultEndDate()
    return analyticsRepository.getEventTypeDistribution(hostId, startDate, endDate)
  }

  getMonthlyRevenue(hostId: string, year?: number): MonthlyRevenueData[] {
    const targetYear = year || new Date().getFullYear()
    return analyticsRepository.getMonthlyRevenue(hostId, targetYear)
  }

  getHostOverview(hostId: string): {
    totalVenues: number
    totalBookings: number
    totalRevenue: number
    pendingBookings: number
    avgRating: number
  } {
    return analyticsRepository.getHostOverview(hostId)
  }

  getAdminOverview(): {
    totalUsers: number
    totalVenues: number
    totalBookings: number
    totalRevenue: number
    pendingVenues: number
    pendingBookings: number
  } {
    return {
      totalUsers: 0,
      totalVenues: 0,
      totalBookings: 0,
      totalRevenue: 0,
      pendingVenues: 0,
      pendingBookings: 0,
    }
  }

  private getDefaultStartDate(): string {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date.toISOString().split('T')[0]
  }

  private getDefaultEndDate(): string {
    return new Date().toISOString().split('T')[0]
  }
}

export const analyticsService = new AnalyticsService()
