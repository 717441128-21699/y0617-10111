import type { Request, Response } from 'express'
import type { ApiResponse, User } from '../../shared/types.js'
import { authService } from '../services/index.js'
import type { LoginRequest, RegisterRequest } from '../services/AuthService.js'

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LoginRequest

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: '邮箱和密码不能为空',
        } as ApiResponse<null>)
        return
      }

      const result = authService.login({ email, password })

      if (!result) {
        res.status(401).json({
          success: false,
          message: '邮箱或密码错误',
        } as ApiResponse<null>)
        return
      }

      res.json({
        success: true,
        data: result,
        message: '登录成功',
      } as ApiResponse<{ user: User; token: string }>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '登录失败',
      } as ApiResponse<null>)
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { role, name, email, phone, password, company } = req.body as RegisterRequest

      if (!role || !name || !email || !phone || !password) {
        res.status(400).json({
          success: false,
          message: '请填写完整的注册信息',
        } as ApiResponse<null>)
        return
      }

      if (!['host', 'customer', 'admin'].includes(role)) {
        res.status(400).json({
          success: false,
          message: '无效的用户角色',
        } as ApiResponse<null>)
        return
      }

      const result = authService.register({ role, name, email, phone, password, company })

      if (!result) {
        res.status(400).json({
          success: false,
          message: '该邮箱已被注册',
        } as ApiResponse<null>)
        return
      }

      res.status(201).json({
        success: true,
        data: result,
        message: '注册成功',
      } as ApiResponse<{ user: User; token: string }>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '注册失败',
      } as ApiResponse<null>)
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: '登出成功',
    } as ApiResponse<null>)
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: req.user,
    } as ApiResponse<User>)
  }
}

export const authController = new AuthController()
