import { BaseRepository } from './BaseRepository.js'
import type { Service, ServiceCategory } from '../../shared/types.js'

export class ServiceRepository extends BaseRepository<Service> {
  private findByVenueIdStmt?: import('better-sqlite3').Statement
  private findByVenueIdAndCategoryStmt?: import('better-sqlite3').Statement
  private findByCategoryStmt?: import('better-sqlite3').Statement

  constructor() {
    super('services')
  }

  protected initStatements(): void {
    this.insertStmt = this.db.prepare(`
      INSERT INTO services (id, venueId, name, category, price, unit, description, image)
      VALUES (@id, @venueId, @name, @category, @price, @unit, @description, @image)
    `)

    this.updateStmt = this.db.prepare(`
      UPDATE services SET
        venueId = @venueId,
        name = @name,
        category = @category,
        price = @price,
        unit = @unit,
        description = @description,
        image = @image
      WHERE id = @id
    `)

    this.findByIdStmt = this.db.prepare('SELECT * FROM services WHERE id = ?')
    this.findAllStmt = this.db.prepare('SELECT * FROM services ORDER BY venueId, category, name')
    this.deleteStmt = this.db.prepare('DELETE FROM services WHERE id = ?')
    this.countStmt = this.db.prepare('SELECT COUNT(*) as count FROM services')

    this.findByVenueIdStmt = this.db.prepare(`
      SELECT * FROM services WHERE venueId = ? ORDER BY category, name
    `)

    this.findByVenueIdAndCategoryStmt = this.db.prepare(`
      SELECT * FROM services WHERE venueId = ? AND category = ? ORDER BY name
    `)

    this.findByCategoryStmt = this.db.prepare(`
      SELECT * FROM services WHERE category = ? ORDER BY name
    `)
  }

  protected toModel(row: Record<string, unknown>): Service {
    return {
      id: row.id as string,
      venueId: row.venueId as string,
      name: row.name as string,
      category: row.category as ServiceCategory,
      price: row.price as number,
      unit: row.unit as string,
      description: row.description as string,
      image: row.image as string | undefined,
    }
  }

  findByVenueId(venueId: string): Service[] {
    const rows = this.findByVenueIdStmt!.all(venueId) as Record<string, unknown>[]
    return rows.map(row => this.toModel(row))
  }

  findByVenueIdAndCategory(venueId: string, category: ServiceCategory): Service[] {
    const rows = this.findByVenueIdAndCategoryStmt!.all(venueId, category) as Record<string, unknown>[]
    return rows.map(row => this.toModel(row))
  }

  findByCategory(category: ServiceCategory): Service[] {
    const rows = this.findByCategoryStmt!.all(category) as Record<string, unknown>[]
    return rows.map(row => this.toModel(row))
  }

  bulkCreate(services: Omit<Service, 'id'>[]): Service[] {
    return this.transaction(() => {
      const results: Service[] = []
      for (const service of services) {
        const created = this.create(service)
        results.push(created)
      }
      return results
    })
  }

  deleteByVenueId(venueId: string): number {
    const stmt = this.db.prepare('DELETE FROM services WHERE venueId = ?')
    const result = stmt.run(venueId) as import('better-sqlite3').RunResult
    return result.changes
  }
}

export const serviceRepository = new ServiceRepository()
