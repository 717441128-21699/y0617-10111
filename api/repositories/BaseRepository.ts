import db from '../db.js'
import type { Database, RunResult, Statement } from 'better-sqlite3'

export abstract class BaseRepository<T> {
  protected db: Database = db
  protected tableName: string
  protected insertStmt?: Statement
  protected updateStmt?: Statement
  protected findByIdStmt?: Statement
  protected findAllStmt?: Statement
  protected deleteStmt?: Statement
  protected countStmt?: Statement

  constructor(tableName: string) {
    this.tableName = tableName
    this.initStatements()
  }

  protected abstract initStatements(): void

  protected abstract toModel(row: Record<string, unknown>): T

  protected toDatabase(model: Partial<T>): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(model)) {
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        result[key] = JSON.stringify(value)
      } else {
        result[key] = value
      }
    }
    return result
  }

  protected parseJsonFields(row: Record<string, unknown>, fields: string[]): Record<string, unknown> {
    const result = { ...row }
    for (const field of fields) {
      if (result[field] && typeof result[field] === 'string') {
        try {
          result[field] = JSON.parse(result[field] as string)
        } catch {
          // Keep original value if parsing fails
        }
      }
    }
    return result
  }

  create(data: Omit<T, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): T {
    const dbData = this.toDatabase(data)
    const result = this.insertStmt!.run(dbData) as RunResult
    const id = dbData.id || result.lastInsertRowid.toString()
    return this.findById(id)!
  }

  findById(id: string): T | null {
    const row = this.findByIdStmt!.get(id) as Record<string, unknown> | undefined
    return row ? this.toModel(row) : null
  }

  findAll(): T[] {
    const rows = this.findAllStmt!.all() as Record<string, unknown>[]
    return rows.map(row => this.toModel(row))
  }

  update(id: string, data: Partial<T>): T | null {
    const dbData = this.toDatabase(data)
    const params = { ...dbData, id }
    this.updateStmt!.run(params)
    return this.findById(id)
  }

  delete(id: string): boolean {
    const result = this.deleteStmt!.run(id) as RunResult
    return result.changes > 0
  }

  count(): number {
    const row = this.countStmt!.get() as { count: number }
    return row.count
  }

  protected query(sql: string, params: unknown[] = []): T[] {
    const stmt = this.db.prepare(sql)
    const rows = stmt.all(...params) as Record<string, unknown>[]
    return rows.map(row => this.toModel(row))
  }

  protected queryOne(sql: string, params: unknown[] = []): T | null {
    const stmt = this.db.prepare(sql)
    const row = stmt.get(...params) as Record<string, unknown> | undefined
    return row ? this.toModel(row) : null
  }

  protected execute(sql: string, params: unknown[] = []): RunResult {
    const stmt = this.db.prepare(sql)
    return stmt.run(...params) as RunResult
  }

  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)()
  }
}
