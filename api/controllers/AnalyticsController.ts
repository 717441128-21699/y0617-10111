import type { Request, Response } from 'express'
import type { ApiResponse, BookingRateData, RevenueData, EventTypeData, MonthlyRevenueData } from '../../shared/types.js'
import { analyticsService } from '../services/index.js'

export class AnalyticsController {
  async getBookingRate(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const { startDate, endDate, venueId } = req.query

      const data = analyticsService.getBookingRate(req.user.id, {
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        venueId: venueId as string | undefined,
      })

      res.json({
        success: true,
        data,
      } as ApiResponse<BookingRateData[]>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取预订率数据失败',
      } as ApiResponse<null>)
    }
  }

  async getRevenue(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const { startDate, endDate } = req.query

      const data = analyticsService.getRevenueBySource(req.user.id, {
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      })

      res.json({
        success: true,
        data,
      } as ApiResponse<RevenueData[]>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取收入数据失败',
      } as ApiResponse<null>)
    }
  }

  async getEventTypes(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const { startDate, endDate } = req.query

      const data = analyticsService.getEventTypeDistribution(req.user.id, {
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      })

      res.json({
        success: true,
        data,
      } as ApiResponse<EventTypeData[]>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取活动类型数据失败',
      } as ApiResponse<null>)
    }
  }

  async getHostOverview(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const data = analyticsService.getHostOverview(req.user.id)

      res.json({
        success: true,
        data,
      } as ApiResponse<typeof data>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取概览数据失败',
      } as ApiResponse<null>)
    }
  }

  async getMonthlyRevenue(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const { year } = req.query
      const yearParam = year ? parseInt(year as string, 10) : undefined

      const data = analyticsService.getMonthlyRevenue(req.user.id, yearParam)

      res.json({
        success: true,
        data,
      } as ApiResponse<MonthlyRevenueData[]>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取月度收入数据失败',
      } as ApiResponse<null>)
    }
  }

  async getAdminOverview(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: '需要管理员权限',
        } as ApiResponse<null>)
        return
      }

      const data = analyticsService.getAdminOverview()

      res.json({
        success: true,
        data,
      } as ApiResponse<typeof data>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取管理概览数据失败',
      } as ApiResponse<null>)
    }
  }
}

export const analyticsController = new AnalyticsController()
