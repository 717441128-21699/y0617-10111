import type { Request, Response } from 'express'
import type { ApiResponse, Venue, CreateVenueRequest, VenueFilterParams, PaginationParams } from '../../shared/types.js'
import { venueService } from '../services/index.js'

export class VenueController {
  async getVenues(req: Request, res: Response): Promise<void> {
    try {
      const {
        city,
        type,
        minPrice,
        maxPrice,
        minCapacity,
        maxCapacity,
        date,
        facilities,
        keyword,
        sortBy,
        sortOrder,
        page = '1',
        pageSize = '10',
      } = req.query

      const filters: VenueFilterParams & PaginationParams = {
        page: parseInt(page as string, 10),
        pageSize: parseInt(pageSize as string, 10),
      }

      if (city) filters.city = city as string
      if (type) filters.type = type as Venue['type']
      if (minPrice !== undefined) filters.minPrice = parseInt(minPrice as string, 10)
      if (maxPrice !== undefined) filters.maxPrice = parseInt(maxPrice as string, 10)
      if (minCapacity !== undefined) filters.minCapacity = parseInt(minCapacity as string, 10)
      if (maxCapacity !== undefined) filters.maxCapacity = parseInt(maxCapacity as string, 10)
      if (date) filters.date = date as string
      if (keyword) filters.keyword = keyword as string
      if (sortBy) filters.sortBy = sortBy as VenueFilterParams['sortBy']
      if (sortOrder) filters.sortOrder = sortOrder as 'asc' | 'desc'
      if (facilities) {
        filters.facilities = Array.isArray(facilities)
          ? (facilities as string[])
          : [(facilities as string)]
      }

      const { venues, total } = venueService.getVenues(filters)

      res.json({
        success: true,
        data: venues,
        total,
      } as ApiResponse<Venue[]>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取场地列表失败',
      } as ApiResponse<null>)
    }
  }

  async getVenueById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const venue = venueService.getVenueById(id)

      if (!venue) {
        res.status(404).json({
          success: false,
          message: '场地不存在',
        } as ApiResponse<null>)
        return
      }

      res.json({
        success: true,
        data: venue,
      } as ApiResponse<Venue>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取场地详情失败',
      } as ApiResponse<null>)
    }
  }

  async getMyVenues(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const venues = venueService.getVenuesByHost(req.user.id)

      res.json({
        success: true,
        data: venues,
      } as ApiResponse<Venue[]>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取我的场地列表失败',
      } as ApiResponse<null>)
    }
  }

  async createVenue(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const data = req.body as CreateVenueRequest

      if (!data.name || !data.type || !data.city || !data.address || !data.area || !data.capacity || !data.description) {
        res.status(400).json({
          success: false,
          message: '请填写完整的场地信息',
        } as ApiResponse<null>)
        return
      }

      const venue = venueService.createVenue(req.user.id, data)

      res.status(201).json({
        success: true,
        data: venue,
        message: '场地创建成功',
      } as ApiResponse<Venue>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '创建场地失败',
      } as ApiResponse<null>)
    }
  }

  async updateVenue(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const { id } = req.params
      const data = req.body as Partial<CreateVenueRequest>

      const venue = venueService.updateVenue(id, req.user.id, data)

      if (!venue) {
        res.status(404).json({
          success: false,
          message: '场地不存在或无权限修改',
        } as ApiResponse<null>)
        return
      }

      res.json({
        success: true,
        data: venue,
        message: '场地更新成功',
      } as ApiResponse<Venue>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '更新场地失败',
      } as ApiResponse<null>)
    }
  }

  async deleteVenue(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const { id } = req.params
      const success = venueService.deleteVenue(id, req.user.id)

      if (!success) {
        res.status(404).json({
          success: false,
          message: '场地不存在或无权限删除',
        } as ApiResponse<null>)
        return
      }

      res.json({
        success: true,
        message: '场地删除成功',
      } as ApiResponse<null>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '删除场地失败',
      } as ApiResponse<null>)
    }
  }
}

export const venueController = new VenueController()
