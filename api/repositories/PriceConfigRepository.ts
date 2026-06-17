import { BaseRepository } from './BaseRepository.js'
import type { PriceConfig, TimeSlot } from '../../shared/types.js'

export class PriceConfigRepository extends BaseRepository<PriceConfig> {
  private findByVenueIdStmt?: import('better-sqlite3').Statement
  private findByVenueAndDateStmt?: import('better-sqlite3').Statement
  private findByVenueAndDateRangeStmt?: import('better-sqlite3').Statement
  private findByVenueDateAndSlotStmt?: import('better-sqlite3').Statement
  private deleteByVenueAndDateStmt?: import('better-sqlite3').Statement

  constructor() {
    super('priceConfigs')
  }

  protected initStatements(): void {
    this.insertStmt = this.db.prepare(`
      INSERT INTO priceConfigs (id, venueId, date, timeSlot, price, isHoliday, isWeekend)
      VALUES (@id, @venueId, @date, @timeSlot, @price, @isHoliday, @isWeekend)
      ON CONFLICT(venueId, date, timeSlot) DO UPDATE SET
        price = excluded.price,
        isHoliday = excluded.isHoliday,
        isWeekend = excluded.isWeekend
    `)

    this.updateStmt = this.db.prepare(`
      UPDATE priceConfigs SET
        venueId = @venueId,
        date = @date,
        timeSlot = @timeSlot,
        price = @price,
        isHoliday = @isHoliday,
        isWeekend = @isWeekend
      WHERE id = @id
    `)

    this.findByIdStmt = this.db.prepare('SELECT * FROM priceConfigs WHERE id = ?')
    this.findAllStmt = this.db.prepare('SELECT * FROM priceConfigs ORDER BY date ASC, timeSlot ASC')
    this.deleteStmt = this.db.prepare('DELETE FROM priceConfigs WHERE id = ?')
    this.countStmt = this.db.prepare('SELECT COUNT(*) as count FROM priceConfigs')

    this.findByVenueIdStmt = this.db.prepare(`
      SELECT * FROM priceConfigs WHERE venueId = ? ORDER BY date ASC, timeSlot ASC
    `)

    this.findByVenueAndDateStmt = this.db.prepare(`
      SELECT * FROM priceConfigs WHERE venueId = ? AND date = ? ORDER BY timeSlot ASC
    `)

    this.findByVenueAndDateRangeStmt = this.db.prepare(`
      SELECT * FROM priceConfigs WHERE venueId = ? AND date >= ? AND date <= ? 
      ORDER BY date ASC, timeSlot ASC
    `)

    this.findByVenueDateAndSlotStmt = this.db.prepare(`
      SELECT * FROM priceConfigs WHERE venueId = ? AND date = ? AND timeSlot = ?
    `)

    this.deleteByVenueAndDateStmt = this.db.prepare(`
      DELETE FROM priceConfigs WHERE venueId = ? AND date = ?
    `)
  }

  protected toModel(row: Record<string, unknown>): PriceConfig {
    return {
      id: row.id as string,
      venueId: row.venueId as string,
      date: row.date as string,
      timeSlot: row.timeSlot as TimeSlot,
      price: row.price as number,
      isHoliday: Boolean(row.isHoliday),
      isWeekend: Boolean(row.isWeekend),
    }
  }

  findByVenueId(venueId: string): PriceConfig[] {
    const rows = this.findByVenueIdStmt!.all(venueId) as Record<string, unknown>[]
    return rows.map(row => this.toModel(row))
  }

  findByVenueAndDate(venueId: string, date: string): PriceConfig[] {
    const rows = this.findByVenueAndDateStmt!.all(venueId, date) as Record<string, unknown>[]
    return rows.map(row => this.toModel(row))
  }

  findByVenueAndDateRange(venueId: string, startDate: string, endDate: string): PriceConfig[] {
    const rows = this.findByVenueAndDateRangeStmt!.all(venueId, startDate, endDate) as Record<string, unknown>[]
    return rows.map(row => this.toModel(row))
  }

  findByVenueDateAndSlot(venueId: string, date: string, timeSlot: TimeSlot): PriceConfig | null {
    const row = this.findByVenueDateAndSlotStmt!.get(venueId, date, timeSlot) as Record<string, unknown> | undefined
    return row ? this.toModel(row) : null
  }

  bulkCreate(configs: Omit<PriceConfig, 'id'>[]): PriceConfig[] {
    return this.transaction(() => {
      const results: PriceConfig[] = []
      for (const config of configs) {
        const created = this.create(config)
        results.push(created)
      }
      return results
    })
  }

  deleteByVenueAndDate(venueId: string, date: string): number {
    const result = this.deleteByVenueAndDateStmt!.run(venueId, date) as import('better-sqlite3').RunResult
    return result.changes
  }
}

export const priceConfigRepository = new PriceConfigRepository()
