import type { Request, Response, NextFunction } from 'express'
import type { User, UserRole, ApiResponse } from '../../shared/types.js'
import { users } from '../persistedData.js'

declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: '未提供认证令牌',
    } as ApiResponse<null>)
    return
  }

  const token = authHeader.slice(7)

  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'))
    const user = users.find((u) => u.id === payload.userId)

    if (!user) {
      res.status(401).json({
        success: false,
        message: '用户不存在',
      } as ApiResponse<null>)
      return
    }

    req.user = user
    next()
  } catch {
    res.status(401).json({
      success: false,
      message: '无效的认证令牌',
    } as ApiResponse<null>)
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: '需要登录',
    } as ApiResponse<null>)
    return
  }
  next()
}

export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: '需要登录',
      } as ApiResponse<null>)
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: '权限不足',
      } as ApiResponse<null>)
      return
    }

    next()
  }
}

export const requireHost = requireRole(['host', 'admin'])
export const requireAdmin = requireRole(['admin'])
