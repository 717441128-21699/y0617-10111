import type { Request, Response } from 'express'
import type { ApiResponse, Booking, CreateBookingRequest, BookingStatus } from '../../shared/types.js'
import { bookingService } from '../services/index.js'

export class BookingController {
  async getBookings(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const { status } = req.query
      const statusParam = status ? (status as BookingStatus) : undefined

      let bookings: Booking[]
      if (req.user.role === 'host' || req.user.role === 'admin') {
        bookings = bookingService.getBookingsByHost(req.user.id, statusParam)
      } else {
        bookings = bookingService.getBookingsByUser(req.user.id, statusParam)
      }

      res.json({
        success: true,
        data: bookings,
      } as ApiResponse<Booking[]>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取预订列表失败',
      } as ApiResponse<null>)
    }
  }

  async getBookingById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const { id } = req.params
      const booking = bookingService.getBookingById(id)

      if (!booking) {
        res.status(404).json({
          success: false,
          message: '预订不存在',
        } as ApiResponse<null>)
        return
      }

      if (booking.userId !== req.user.id && req.user.role === 'customer') {
        res.status(403).json({
          success: false,
          message: '无权限查看此预订',
        } as ApiResponse<null>)
        return
      }

      res.json({
        success: true,
        data: booking,
      } as ApiResponse<Booking>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取预订详情失败',
      } as ApiResponse<null>)
    }
  }

  async createBooking(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const data = req.body as CreateBookingRequest

      if (!data.venueId || !data.date || !data.timeSlot || !data.eventType || !data.estimatedPeople || !data.selectedServices) {
        res.status(400).json({
          success: false,
          message: '请填写完整的预订信息',
        } as ApiResponse<null>)
        return
      }

      const booking = bookingService.createBooking(req.user.id, data)

      if (!booking) {
        res.status(400).json({
          success: false,
          message: '该时段已被预订，请选择其他时段',
        } as ApiResponse<null>)
        return
      }

      res.status(201).json({
        success: true,
        data: booking,
        message: '预订创建成功',
      } as ApiResponse<Booking>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '创建预订失败',
      } as ApiResponse<null>)
    }
  }

  async updateBookingStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const { id } = req.params
      const { status, hostReply } = req.body as { status: BookingStatus; hostReply?: string }

      if (!status) {
        res.status(400).json({
          success: false,
          message: '请提供状态',
        } as ApiResponse<null>)
        return
      }

      const booking = bookingService.updateBookingStatus(id, req.user.id, status, hostReply)

      if (!booking) {
        res.status(404).json({
          success: false,
          message: '预订不存在或无权限修改',
        } as ApiResponse<null>)
        return
      }

      res.json({
        success: true,
        data: booking,
        message: '预订状态更新成功',
      } as ApiResponse<Booking>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '更新预订状态失败',
      } as ApiResponse<null>)
    }
  }

  async payDeposit(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const { id } = req.params
      const booking = bookingService.payDeposit(id, req.user.id)

      if (!booking) {
        res.status(400).json({
          success: false,
          message: '支付失败，请检查预订状态',
        } as ApiResponse<null>)
        return
      }

      res.json({
        success: true,
        data: booking,
        message: '定金支付成功',
      } as ApiResponse<Booking>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '支付定金失败',
      } as ApiResponse<null>)
    }
  }

  async deleteBooking(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const { id } = req.params
      const success = bookingService.deleteBooking(id, req.user.id)

      if (!success) {
        res.status(404).json({
          success: false,
          message: '预订不存在或无法取消',
        } as ApiResponse<null>)
        return
      }

      res.json({
        success: true,
        message: '预订取消成功',
      } as ApiResponse<null>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '取消预订失败',
      } as ApiResponse<null>)
    }
  }
}

export const bookingController = new BookingController()
