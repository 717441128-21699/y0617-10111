import type { User, UserRole } from '../../shared/types.js'
import { userRepository } from '../repositories/index.js'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  role: UserRole
  name: string
  email: string
  phone: string
  password: string
  company?: string
}

export interface AuthResult {
  user: User
  token: string
}

export class AuthService {
  login(request: LoginRequest): AuthResult | null {
    const user = userRepository.findByEmail(request.email)
    if (!user) return null

    const token = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64')
    return { user, token }
  }

  register(request: RegisterRequest): AuthResult | null {
    const existing = userRepository.findByEmail(request.email)
    if (existing) return null

    const user = userRepository.create({
      role: request.role,
      name: request.name,
      email: request.email,
      phone: request.phone,
      company: request.company,
      createdAt: new Date().toISOString(),
    })

    const token = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64')
    return { user, token }
  }
}

export const authService = new AuthService()
