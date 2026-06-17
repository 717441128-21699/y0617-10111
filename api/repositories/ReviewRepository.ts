import { BaseRepository } from './BaseRepository.js'
import type { Review } from '../../shared/types.js'

export class ReviewRepository extends BaseRepository<Review> {
  private findByVenueIdStmt?: import('better-sqlite3').Statement
  private findByUserIdStmt?: import('better-sqlite3').Statement
  private findByBookingIdStmt?: import('better-sqlite3').Statement
  private findByHostIdStmt?: import('better-sqlite3').Statement

  constructor() {
    super('reviews')
  }

  protected initStatements(): void {
    this.insertStmt = this.db.prepare(`
      INSERT INTO reviews (id, bookingId, venueId, userId, rating, content, hostReply, userReply, createdAt)
      VALUES (@id, @bookingId, @venueId, @userId, @rating, @content, @hostReply, @userReply, @createdAt)
    `)

    this.updateStmt = this.db.prepare(`
      UPDATE reviews SET
        bookingId = @bookingId,
        venueId = @venueId,
        userId = @userId,
        rating = @rating,
        content = @content,
        hostReply = @hostReply,
        userReply = @userReply
      WHERE id = @id
    `)

    this.findByIdStmt = this.db.prepare('SELECT * FROM reviews WHERE id = ?')
    this.findAllStmt = this.db.prepare('SELECT * FROM reviews ORDER BY createdAt DESC')
    this.deleteStmt = this.db.prepare('DELETE FROM reviews WHERE id = ?')
    this.countStmt = this.db.prepare('SELECT COUNT(*) as count FROM reviews')

    this.findByVenueIdStmt = this.db.prepare(`
      SELECT * FROM reviews WHERE venueId = ? ORDER BY createdAt DESC
    `)

    this.findByUserIdStmt = this.db.prepare(`
      SELECT * FROM reviews WHERE userId = ? ORDER BY createdAt DESC
    `)

    this.findByBookingIdStmt = this.db.prepare(`
      SELECT * FROM reviews WHERE bookingId = ?
    `)

    this.findByHostIdStmt = this.db.prepare(`
      SELECT r.* FROM reviews r
      INNER JOIN venues v ON r.venueId = v.id
      WHERE v.hostId = ? ORDER BY r.createdAt DESC
    `)
  }

  protected toModel(row: Record<string, unknown>): Review {
    return {
      id: row.id as string,
      bookingId: row.bookingId as string,
      venueId: row.venueId as string,
      userId: row.userId as string,
      rating: row.rating as number,
      content: row.content as string,
      hostReply: row.hostReply as string | undefined,
      userReply: row.userReply as string | undefined,
      createdAt: row.createdAt as string,
    }
  }

  findByVenueId(venueId: string, page: number = 1, pageSize: number = 10): { reviews: Review[]; total: number } {
    const countSql = 'SELECT COUNT(*) as count FROM reviews WHERE venueId = ?'
    const countStmt = this.db.prepare(countSql)
    const countResult = countStmt.get(venueId) as { count: number }

    const offset = (page - 1) * pageSize
    const dataSql = `SELECT * FROM reviews WHERE venueId = ? ORDER BY createdAt DESC LIMIT ${pageSize} OFFSET ${offset}`
    const dataStmt = this.db.prepare(dataSql)
    const rows = dataStmt.all(venueId) as Record<string, unknown>[]
    const reviews = rows.map(row => this.toModel(row))

    return { reviews, total: countResult.count }
  }

  findByUserId(userId: string): Review[] {
    const rows = this.findByUserIdStmt!.all(userId) as Record<string, unknown>[]
    return rows.map(row => this.toModel(row))
  }

  findByBookingId(bookingId: string): Review | null {
    const row = this.findByBookingIdStmt!.get(bookingId) as Record<string, unknown> | undefined
    return row ? this.toModel(row) : null
  }

  findByHostId(hostId: string): Review[] {
    const rows = this.findByHostIdStmt!.all(hostId) as Record<string, unknown>[]
    return rows.map(row => this.toModel(row))
  }

  updateHostReply(reviewId: string, hostReply: string): Review | null {
    const stmt = this.db.prepare('UPDATE reviews SET hostReply = ? WHERE id = ?')
    stmt.run(hostReply, reviewId)
    return this.findById(reviewId)
  }

  updateUserReply(reviewId: string, userReply: string): Review | null {
    const stmt = this.db.prepare('UPDATE reviews SET userReply = ? WHERE id = ?')
    stmt.run(userReply, reviewId)
    return this.findById(reviewId)
  }

  getAverageRatingByVenueId(venueId: string): { rating: number; count: number } {
    const stmt = this.db.prepare(`
      SELECT AVG(rating) as rating, COUNT(*) as count 
      FROM reviews 
      WHERE venueId = ?
    `)
    const result = stmt.get(venueId) as { rating: number | null; count: number }
    return {
      rating: result.rating || 0,
      count: result.count || 0,
    }
  }
}

export const reviewRepository = new ReviewRepository()
