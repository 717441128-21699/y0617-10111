import { BaseRepository } from './BaseRepository.js'
import type { Venue, VenueType, VenueStatus, VenueFilterParams, PaginationParams, StyleImage } from '../../shared/types.js'

export class VenueRepository extends BaseRepository<Venue> {
  private findByHostIdStmt?: import('better-sqlite3').Statement
  private findByStatusStmt?: import('better-sqlite3').Statement
  private findByCityStmt?: import('better-sqlite3').Statement

  constructor() {
    super('venues')
  }

  protected initStatements(): void {
    this.insertStmt = this.db.prepare(`
      INSERT INTO venues (
        id, name, type, city, address, area, capacity, height, description,
        facilities, images, styleImages, basePrice, rating, reviewCount, status, hostId, createdAt
      ) VALUES (
        @id, @name, @type, @city, @address, @area, @capacity, @height, @description,
        @facilities, @images, @styleImages, @basePrice, @rating, @reviewCount, @status, @hostId, @createdAt
      )
    `)

    this.updateStmt = this.db.prepare(`
      UPDATE venues SET
        name = @name,
        type = @type,
        city = @city,
        address = @address,
        area = @area,
        capacity = @capacity,
        height = @height,
        description = @description,
        facilities = @facilities,
        images = @images,
        styleImages = @styleImages,
        basePrice = @basePrice,
        rating = @rating,
        reviewCount = @reviewCount,
        status = @status,
        hostId = @hostId
      WHERE id = @id
    `)

    this.findByIdStmt = this.db.prepare('SELECT * FROM venues WHERE id = ?')
    this.findAllStmt = this.db.prepare('SELECT * FROM venues ORDER BY createdAt DESC')
    this.deleteStmt = this.db.prepare('DELETE FROM venues WHERE id = ?')
    this.countStmt = this.db.prepare('SELECT COUNT(*) as count FROM venues')

    this.findByHostIdStmt = this.db.prepare('SELECT * FROM venues WHERE hostId = ? ORDER BY createdAt DESC')
    this.findByStatusStmt = this.db.prepare('SELECT * FROM venues WHERE status = ? ORDER BY createdAt DESC')
    this.findByCityStmt = this.db.prepare('SELECT * FROM venues WHERE city = ? ORDER BY createdAt DESC')
  }

  protected toModel(row: Record<string, unknown>): Venue {
    const parsed = this.parseJsonFields(row, ['facilities', 'images', 'styleImages'])
    return {
      id: parsed.id as string,
      name: parsed.name as string,
      type: parsed.type as VenueType,
      city: parsed.city as string,
      address: parsed.address as string,
      area: parsed.area as number,
      capacity: parsed.capacity as number,
      height: parsed.height as number | undefined,
      description: parsed.description as string,
      facilities: parsed.facilities as string[],
      images: parsed.images as string[],
      styleImages: parsed.styleImages as StyleImage[],
      basePrice: parsed.basePrice as number,
      rating: parsed.rating as number,
      reviewCount: parsed.reviewCount as number,
      status: parsed.status as VenueStatus,
      hostId: parsed.hostId as string,
      createdAt: parsed.createdAt as string,
    }
  }

  findByHostId(hostId: string): Venue[] {
    const rows = this.findByHostIdStmt!.all(hostId) as Record<string, unknown>[]
    return rows.map(row => this.toModel(row))
  }

  findByStatus(status: VenueStatus): Venue[] {
    const rows = this.findByStatusStmt!.all(status) as Record<string, unknown>[]
    return rows.map(row => this.toModel(row))
  }

  findByCity(city: string): Venue[] {
    const rows = this.findByCityStmt!.all(city) as Record<string, unknown>[]
    return rows.map(row => this.toModel(row))
  }

  filter(filters: VenueFilterParams & PaginationParams): { venues: Venue[]; total: number } {
    const conditions: string[] = ['status = ?']
    const params: unknown[] = ['published']

    if (filters.city) {
      conditions.push('city = ?')
      params.push(filters.city)
    }

    if (filters.type) {
      conditions.push('type = ?')
      params.push(filters.type)
    }

    if (filters.minPrice !== undefined) {
      conditions.push('basePrice >= ?')
      params.push(filters.minPrice)
    }

    if (filters.maxPrice !== undefined) {
      conditions.push('basePrice <= ?')
      params.push(filters.maxPrice)
    }

    if (filters.minCapacity !== undefined) {
      conditions.push('capacity >= ?')
      params.push(filters.minCapacity)
    }

    if (filters.maxCapacity !== undefined) {
      conditions.push('capacity <= ?')
      params.push(filters.maxCapacity)
    }

    if (filters.keyword) {
      conditions.push('(name LIKE ? OR description LIKE ? OR address LIKE ?)')
      const keyword = `%${filters.keyword}%`
      params.push(keyword, keyword, keyword)
    }

    if (filters.facilities && filters.facilities.length > 0) {
      const facilityConditions = filters.facilities.map(() => 'facilities LIKE ?')
      conditions.push(`(${facilityConditions.join(' AND ')})`)
      filters.facilities.forEach(f => params.push(`%${f}%`))
    }

    if (filters.date) {
      conditions.push(`
        id NOT IN (
          SELECT venueId FROM bookings 
          WHERE date = ? AND status IN ('pending', 'approved', 'depositPaid', 'confirmed')
        )
      `)
      params.push(filters.date)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const sortBy = filters.sortBy || 'rating'
    const sortOrder = filters.sortOrder || 'desc'
    const orderClause = `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}, createdAt DESC`

    const limit = filters.pageSize
    const offset = (filters.page - 1) * filters.pageSize

    const countSql = `SELECT COUNT(*) as count FROM venues ${whereClause}`
    const dataSql = `SELECT * FROM venues ${whereClause} ${orderClause} LIMIT ${limit} OFFSET ${offset}`

    const countStmt = this.db.prepare(countSql)
    const countResult = countStmt.get(...params) as { count: number }

    const dataStmt = this.db.prepare(dataSql)
    const rows = dataStmt.all(...params) as Record<string, unknown>[]
    const venues = rows.map(row => this.toModel(row))

    return { venues, total: countResult.count }
  }

  updateRating(venueId: string, rating: number, reviewCount: number): Venue | null {
    const stmt = this.db.prepare('UPDATE venues SET rating = ?, reviewCount = ? WHERE id = ?')
    stmt.run(rating, reviewCount, venueId)
    return this.findById(venueId)
  }

  updateStatus(venueId: string, status: VenueStatus): Venue | null {
    const stmt = this.db.prepare('UPDATE venues SET status = ? WHERE id = ?')
    stmt.run(status, venueId)
    return this.findById(venueId)
  }
}

export const venueRepository = new VenueRepository()
