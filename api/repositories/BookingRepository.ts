import { BaseRepository } from './BaseRepository.js'
import type { Booking, BookingStatus, TimeSlot, SelectedService } from '../../shared/types.js'

export class BookingRepository extends BaseRepository<Booking> {
  private findByUserIdStmt?: import('better-sqlite3').Statement
  private findByVenueIdStmt?: import('better-sqlite3').Statement
  private findByUserIdAndStatusStmt?: import('better-sqlite3').Statement
  private findByVenueIdAndStatusStmt?: import('better-sqlite3').Statement
  private findByVenueIdAndDateStmt?: import('better-sqlite3').Statement
  private updateStatusStmt?: import('better-sqlite3').Statement
  private findOverlappingStmt?: import('better-sqlite3').Statement

  constructor() {
    super('bookings')
  }

  protected initStatements(): void {
    this.insertStmt = this.db.prepare(`
      INSERT INTO bookings (
        id, venueId, userId, date, timeSlot, eventType, estimatedPeople,
        specialRequirements, selectedServices, totalAmount, deposit, status, hostReply, createdAt
      ) VALUES (
        @id, @venueId, @userId, @date, @timeSlot, @eventType, @estimatedPeople,
        @specialRequirements, @selectedServices, @totalAmount, @deposit, @status, @hostReply, @createdAt
      )
    `)

    this.updateStmt = this.db.prepare(`
      UPDATE bookings SET
        venueId = @venueId,
        userId = @userId,
        date = @date,
        timeSlot = @timeSlot,
        eventType = @eventType,
        estimatedPeople = @estimatedPeople,
        specialRequirements = @specialRequirements,
        selectedServices = @selectedServices,
        totalAmount = @totalAmount,
        deposit = @deposit,
        status = @status,
        hostReply = @hostReply
      WHERE id = @id
    `)

    this.findByIdStmt = this.db.prepare('SELECT * FROM bookings WHERE id = ?')
    this.findAllStmt = this.db.prepare('SELECT * FROM bookings ORDER BY createdAt DESC')
    this.deleteStmt = this.db.prepare('DELETE FROM bookings WHERE id = ?')
    this.countStmt = this.db.prepare('SELECT COUNT(*) as count FROM bookings')

    this.findByUserIdStmt = this.db.prepare(`
      SELECT * FROM bookings WHERE userId = ? ORDER BY createdAt DESC
    `)

    this.findByVenueIdStmt = this.db.prepare(`
      SELECT * FROM bookings WHERE venueId = ? ORDER BY createdAt DESC
    `)

    this.findByUserIdAndStatusStmt = this.db.prepare(`
      SELECT * FROM bookings WHERE userId = ? AND status = ? ORDER BY createdAt DESC
    `)

    this.findByVenueIdAndStatusStmt = this.db.prepare(`
      SELECT * FROM bookings WHERE venueId = ? AND status = ? ORDER BY createdAt DESC
    `)

    this.findByVenueIdAndDateStmt = this.db.prepare(`
      SELECT * FROM bookings WHERE venueId = ? AND date = ? AND status IN ('pending', 'approved', 'depositPaid', 'confirmed')
    `)

    this.updateStatusStmt = this.db.prepare(`
      UPDATE bookings SET status = ?, hostReply = ? WHERE id = ?
    `)

    this.findOverlappingStmt = this.db.prepare(`
      SELECT * FROM bookings 
      WHERE venueId = ? AND date = ? AND timeSlot = ? AND status IN ('pending', 'approved', 'depositPaid', 'confirmed') AND id != ?
    `)
  }

  protected toModel(row: Record<string, unknown>): Booking {
    const parsed = this.parseJsonFields(row, ['selectedServices'])
    return {
      id: parsed.id as string,
      venueId: parsed.venueId as string,
      userId: parsed.userId as string,
      date: parsed.date as string,
      timeSlot: parsed.timeSlot as TimeSlot,
      eventType: parsed.eventType as string,
      estimatedPeople: parsed.estimatedPeople as number,
      specialRequirements: parsed.specialRequirements as string | undefined,
      selectedServices: parsed.selectedServices as SelectedService[],
      totalAmount: parsed.totalAmount as number,
      deposit: parsed.deposit as number,
      status: parsed.status as BookingStatus,
      hostReply: parsed.hostReply as string | undefined,
      createdAt: parsed.createdAt as string,
    }
  }

  findByUserId(userId: string): Booking[] {
    const rows = this.findByUserIdStmt!.all(userId) as Record<string, unknown>[]
    return rows.map(row => this.toModel(row))
  }

  findByVenueId(venueId: string): Booking[] {
    const rows = this.findByVenueIdStmt!.all(venueId) as Record<string, unknown>[]
    return rows.map(row => this.toModel(row))
  }

  findByUserIdAndStatus(userId: string, status: BookingStatus): Booking[] {
    const rows = this.findByUserIdAndStatusStmt!.all(userId, status) as Record<string, unknown>[]
    return rows.map(row => this.toModel(row))
  }

  findByVenueIdAndStatus(venueId: string, status: BookingStatus): Booking[] {
    const rows = this.findByVenueIdAndStatusStmt!.all(venueId, status) as Record<string, unknown>[]
    return rows.map(row => this.toModel(row))
  }

  findByVenueIdAndDate(venueId: string, date: string): Booking[] {
    const rows = this.findByVenueIdAndDateStmt!.all(venueId, date) as Record<string, unknown>[]
    return rows.map(row => this.toModel(row))
  }

  updateStatus(id: string, status: BookingStatus, hostReply?: string): Booking | null {
    this.updateStatusStmt!.run(status, hostReply || null, id)
    return this.findById(id)
  }

  checkOverlap(venueId: string, date: string, timeSlot: TimeSlot, excludeBookingId?: string): boolean {
    const rows = this.findOverlappingStmt!.all(venueId, date, timeSlot, excludeBookingId || '') as Record<string, unknown>[]
    return rows.length > 0
  }

  getUpcomingBookingsByHost(hostId: string): Booking[] {
    const sql = `
      SELECT b.* FROM bookings b
      INNER JOIN venues v ON b.venueId = v.id
      WHERE v.hostId = ? AND b.date >= date('now') AND b.status IN ('pending', 'approved', 'depositPaid', 'confirmed')
      ORDER BY b.date ASC, b.createdAt DESC
    `
    return this.query(sql, [hostId])
  }

  getBookingsByHostAndStatus(hostId: string, status: BookingStatus): Booking[] {
    const sql = `
      SELECT b.* FROM bookings b
      INNER JOIN venues v ON b.venueId = v.id
      WHERE v.hostId = ? AND b.status = ?
      ORDER BY b.createdAt DESC
    `
    return this.query(sql, [hostId, status])
  }
}

export const bookingRepository = new BookingRepository()
