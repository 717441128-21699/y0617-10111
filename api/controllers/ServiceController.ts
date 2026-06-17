import type { Request, Response } from 'express'
import type { ApiResponse, Service, CreateServiceRequest } from '../../shared/types.js'
import { serviceService } from '../services/index.js'

export class ServiceController {
  async getServicesByVenue(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const services = serviceService.getServicesByVenue(id)

      res.json({
        success: true,
        data: services,
      } as ApiResponse<Service[]>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取服务列表失败',
      } as ApiResponse<null>)
    }
  }

  async createService(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const { id: venueId } = req.params
      const data = req.body as CreateServiceRequest

      if (!data.name || !data.category || !data.price || !data.unit || !data.description) {
        res.status(400).json({
          success: false,
          message: '请填写完整的服务信息',
        } as ApiResponse<null>)
        return
      }

      const service = serviceService.createService(venueId, req.user.id, data)

      if (!service) {
        res.status(404).json({
          success: false,
          message: '场地不存在或无权限操作',
        } as ApiResponse<null>)
        return
      }

      res.status(201).json({
        success: true,
        data: service,
        message: '服务创建成功',
      } as ApiResponse<Service>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '创建服务失败',
      } as ApiResponse<null>)
    }
  }

  async updateService(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const { id } = req.params
      const data = req.body as Partial<CreateServiceRequest>

      const service = serviceService.updateService(id, req.user.id, data)

      if (!service) {
        res.status(404).json({
          success: false,
          message: '服务不存在或无权限修改',
        } as ApiResponse<null>)
        return
      }

      res.json({
        success: true,
        data: service,
        message: '服务更新成功',
      } as ApiResponse<Service>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '更新服务失败',
      } as ApiResponse<null>)
    }
  }

  async deleteService(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const { id } = req.params
      const success = serviceService.deleteService(id, req.user.id)

      if (!success) {
        res.status(404).json({
          success: false,
          message: '服务不存在或无权限删除',
        } as ApiResponse<null>)
        return
      }

      res.json({
        success: true,
        message: '服务删除成功',
      } as ApiResponse<null>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '删除服务失败',
      } as ApiResponse<null>)
    }
  }
}

export const serviceController = new ServiceController()
