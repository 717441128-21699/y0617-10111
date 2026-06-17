import db from '../db.js'
import type { BookingRateData, RevenueData, EventTypeData, MonthlyRevenueData } from '../../shared/types.js'

export class AnalyticsRepository {
  private db = db

  getBookingRateByVenue(venueId: string, startDate: string, endDate: string): BookingRateData[] {
    const sql = `
      SELECT 
        date,
        COUNT(*) as bookedSlots,
        3 as totalSlots,
        ROUND(COUNT(*) * 100.0 / 3, 2) as rate
      FROM bookings
      WHERE venueId = ? 
        AND date >= ? 
        AND date <= ?
        AND status IN ('approved', 'depositPaid', 'confirmed', 'completed')
      GROUP BY date
      ORDER BY date ASC
    `
    const stmt = this.db.prepare(sql)
    const rows = stmt.all(venueId, startDate, endDate) as Record<string, unknown>[]
    return rows.map(row => ({
      date: row.date as string,
      rate: row.rate as number,
      totalSlots: row.totalSlots as number,
      bookedSlots: row.bookedSlots as number,
    }))
  }

  getBookingRateByHost(hostId: string, startDate: string, endDate: string): BookingRateData[] {
    const sql = `
      SELECT 
        b.date,
        COUNT(*) as bookedSlots,
        (SELECT COUNT(*) * 3 FROM venues v WHERE v.hostId = ?) as totalSlots,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) * 3 FROM venues v WHERE v.hostId = ?), 2) as rate
      FROM bookings b
      INNER JOIN venues v ON b.venueId = v.id
      WHERE v.hostId = ? 
        AND b.date >= ? 
        AND b.date <= ?
        AND b.status IN ('approved', 'depositPaid', 'confirmed', 'completed')
      GROUP BY b.date
      ORDER BY b.date ASC
    `
    const stmt = this.db.prepare(sql)
    const rows = stmt.all(hostId, hostId, hostId, startDate, endDate) as Record<string, unknown>[]
    return rows.map(row => ({
      date: row.date as string,
      rate: row.rate as number,
      totalSlots: row.totalSlots as number,
      bookedSlots: row.bookedSlots as number,
    }))
  }

  getRevenueBySource(hostId: string, startDate: string, endDate: string): RevenueData[] {
    const sql = `
      SELECT 
        'venue' as source,
        SUM(b.totalAmount) as total
      FROM bookings b
      INNER JOIN venues v ON b.venueId = v.id
      WHERE v.hostId = ? 
        AND b.date >= ? 
        AND b.date <= ?
        AND b.status IN ('confirmed', 'completed')
      
      UNION ALL
      
      SELECT 
        'service' as source,
        SUM(s.price * ss.quantity) as total
      FROM bookings b
      INNER JOIN venues v ON b.venueId = v.id,
           json_each(b.selectedServices) as ss
      INNER JOIN services s ON ss.value.serviceId = s.id
      WHERE v.hostId = ? 
        AND b.date >= ? 
        AND b.date <= ?
        AND b.status IN ('confirmed', 'completed')
    `
    const stmt = this.db.prepare(sql)
    const rows = stmt.all(hostId, startDate, endDate, hostId, startDate, endDate) as { source: string; total: number | null }[]

    const venueTotal = rows.find(r => r.source === 'venue')?.total || 0
    const serviceTotal = rows.find(r => r.source === 'service')?.total || 0
    const totalRevenue = venueTotal + serviceTotal

    return [
      {
        source: 'venue',
        amount: venueTotal,
        percentage: totalRevenue > 0 ? Math.round((venueTotal / totalRevenue) * 10000) / 100 : 0,
      },
      {
        source: 'service',
        amount: serviceTotal,
        percentage: totalRevenue > 0 ? Math.round((serviceTotal / totalRevenue) * 10000) / 100 : 0,
      },
    ]
  }

  getEventTypeDistribution(hostId: string, startDate: string, endDate: string): EventTypeData[] {
    const sql = `
      SELECT 
        b.eventType as type,
        COUNT(*) as count
      FROM bookings b
      INNER JOIN venues v ON b.venueId = v.id
      WHERE v.hostId = ? 
        AND b.date >= ? 
        AND b.date <= ?
        AND b.status IN ('approved', 'depositPaid', 'confirmed', 'completed')
      GROUP BY b.eventType
      ORDER BY count DESC
    `
    const stmt = this.db.prepare(sql)
    const rows = stmt.all(hostId, startDate, endDate) as { type: string; count: number }[]

    const total = rows.reduce((sum, r) => sum + r.count, 0)

    return rows.map(row => ({
      type: row.type,
      count: row.count,
      percentage: total > 0 ? Math.round((row.count / total) * 10000) / 100 : 0,
    }))
  }

  getMonthlyRevenue(hostId: string, year: number): MonthlyRevenueData[] {
    const sql = `
      SELECT 
        strftime('%Y-%m', b.date) as month,
        SUM(b.totalAmount) as revenue,
        COUNT(*) as bookings
      FROM bookings b
      INNER JOIN venues v ON b.venueId = v.id
      WHERE v.hostId = ? 
        AND strftime('%Y', b.date) = ?
        AND b.status IN ('confirmed', 'completed')
      GROUP BY strftime('%Y-%m', b.date)
      ORDER BY month ASC
    `
    const stmt = this.db.prepare(sql)
    const rows = stmt.all(hostId, year.toString()) as { month: string; revenue: number; bookings: number }[]

    const result: MonthlyRevenueData[] = []
    for (let i = 1; i <= 12; i++) {
      const monthStr = `${year}-${i.toString().padStart(2, '0')}`
      const existing = rows.find(r => r.month === monthStr)
      result.push({
        month: monthStr,
        revenue: existing?.revenue || 0,
        bookings: existing?.bookings || 0,
      })
    }
    return result
  }

  getVenueBookingStats(venueId: string, startDate: string, endDate: string): {
    totalBookings: number
    confirmedBookings: number
    cancelledBookings: number
    totalRevenue: number
    avgRating: number
  } {
    const sql = `
      SELECT 
        COUNT(*) as totalBookings,
        SUM(CASE WHEN status IN ('confirmed', 'completed') THEN 1 ELSE 0 END) as confirmedBookings,
        SUM(CASE WHEN status = 'cancelled' OR status = 'rejected' THEN 1 ELSE 0 END) as cancelledBookings,
        SUM(CASE WHEN status IN ('confirmed', 'completed') THEN totalAmount ELSE 0 END) as totalRevenue
      FROM bookings
      WHERE venueId = ? 
        AND date >= ? 
        AND date <= ?
    `
    const stmt = this.db.prepare(sql)
    const bookingStats = stmt.get(venueId, startDate, endDate) as {
      totalBookings: number
      confirmedBookings: number
      cancelledBookings: number
      totalRevenue: number
    }

    const ratingSql = `
      SELECT AVG(rating) as avgRating
      FROM reviews
      WHERE venueId = ?
    `
    const ratingStmt = this.db.prepare(ratingSql)
    const ratingResult = ratingStmt.get(venueId) as { avgRating: number | null }

    return {
      totalBookings: bookingStats.totalBookings || 0,
      confirmedBookings: bookingStats.confirmedBookings || 0,
      cancelledBookings: bookingStats.cancelledBookings || 0,
      totalRevenue: bookingStats.totalRevenue || 0,
      avgRating: ratingResult.avgRating || 0,
    }
  }

  getHostOverview(hostId: string): {
    totalVenues: number
    totalBookings: number
    totalRevenue: number
    pendingBookings: number
    avgRating: number
  } {
    const venueSql = `
      SELECT COUNT(*) as totalVenues
      FROM venues
      WHERE hostId = ? AND status = 'published'
    `
    const venueStmt = this.db.prepare(venueSql)
    const venueResult = venueStmt.get(hostId) as { totalVenues: number }

    const bookingSql = `
      SELECT 
        COUNT(*) as totalBookings,
        SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.totalAmount ELSE 0 END) as totalRevenue,
        SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) as pendingBookings
      FROM bookings b
      INNER JOIN venues v ON b.venueId = v.id
      WHERE v.hostId = ?
    `
    const bookingStmt = this.db.prepare(bookingSql)
    const bookingResult = bookingStmt.get(hostId) as {
      totalBookings: number
      totalRevenue: number
      pendingBookings: number
    }

    const ratingSql = `
      SELECT AVG(r.rating) as avgRating
      FROM reviews r
      INNER JOIN venues v ON r.venueId = v.id
      WHERE v.hostId = ?
    `
    const ratingStmt = this.db.prepare(ratingSql)
    const ratingResult = ratingStmt.get(hostId) as { avgRating: number | null }

    return {
      totalVenues: venueResult.totalVenues || 0,
      totalBookings: bookingResult.totalBookings || 0,
      totalRevenue: bookingResult.totalRevenue || 0,
      pendingBookings: bookingResult.pendingBookings || 0,
      avgRating: ratingResult.avgRating || 0,
    }
  }
}

export const analyticsRepository = new AnalyticsRepository()
