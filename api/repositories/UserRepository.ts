import { BaseRepository } from './BaseRepository.js'
import type { User, UserRole } from '../../shared/types.js'

export class UserRepository extends BaseRepository<User> {
  private findByEmailStmt?: import('better-sqlite3').Statement
  private findByRoleStmt?: import('better-sqlite3').Statement

  constructor() {
    super('users')
  }

  protected initStatements(): void {
    this.insertStmt = this.db.prepare(`
      INSERT INTO users (id, role, name, email, phone, avatar, company, createdAt)
      VALUES (@id, @role, @name, @email, @phone, @avatar, @company, @createdAt)
    `)

    this.updateStmt = this.db.prepare(`
      UPDATE users SET
        role = @role,
        name = @name,
        email = @email,
        phone = @phone,
        avatar = @avatar,
        company = @company
      WHERE id = @id
    `)

    this.findByIdStmt = this.db.prepare('SELECT * FROM users WHERE id = ?')
    this.findAllStmt = this.db.prepare('SELECT * FROM users ORDER BY createdAt DESC')
    this.deleteStmt = this.db.prepare('DELETE FROM users WHERE id = ?')
    this.countStmt = this.db.prepare('SELECT COUNT(*) as count FROM users')

    this.findByEmailStmt = this.db.prepare('SELECT * FROM users WHERE email = ?')
    this.findByRoleStmt = this.db.prepare('SELECT * FROM users WHERE role = ? ORDER BY createdAt DESC')
  }

  protected toModel(row: Record<string, unknown>): User {
    return {
      id: row.id as string,
      role: row.role as UserRole,
      name: row.name as string,
      email: row.email as string,
      phone: row.phone as string,
      avatar: row.avatar as string | undefined,
      company: row.company as string | undefined,
      createdAt: row.createdAt as string,
    }
  }

  findByEmail(email: string): User | null {
    const row = this.findByEmailStmt!.get(email) as Record<string, unknown> | undefined
    return row ? this.toModel(row) : null
  }

  findByRole(role: UserRole): User[] {
    const rows = this.findByRoleStmt!.all(role) as Record<string, unknown>[]
    return rows.map(row => this.toModel(row))
  }
}

export const userRepository = new UserRepository()
