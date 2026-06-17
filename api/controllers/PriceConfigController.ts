import type { Request, Response } from 'express'
import type { ApiResponse, PriceConfig, PriceConfigRequest } from '../../shared/types.js'
import { priceConfigService } from '../services/index.js'

export class PriceConfigController {
  async getPriceConfigsByVenue(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const configs = priceConfigService.getPriceConfigsByVenue(id)

      res.json({
        success: true,
        data: configs,
      } as ApiResponse<PriceConfig[]>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取价格配置失败',
      } as ApiResponse<null>)
    }
  }

  async createPriceConfig(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const { id: venueId } = req.params
      const data = req.body as PriceConfigRequest

      if (!data.date || !data.timeSlot || !data.price) {
        res.status(400).json({
          success: false,
          message: '请填写完整的价格配置信息',
        } as ApiResponse<null>)
        return
      }

      const config = priceConfigService.createPriceConfig(venueId, req.user.id, data)

      if (!config) {
        res.status(404).json({
          success: false,
          message: '场地不存在或无权限操作',
        } as ApiResponse<null>)
        return
      }

      res.status(201).json({
        success: true,
        data: config,
        message: '价格配置创建成功',
      } as ApiResponse<PriceConfig>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '创建价格配置失败',
      } as ApiResponse<null>)
    }
  }

  async updatePriceConfig(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const { id } = req.params
      const data = req.body as Partial<PriceConfigRequest>

      const config = priceConfigService.updatePriceConfig(id, req.user.id, data)

      if (!config) {
        res.status(404).json({
          success: false,
          message: '价格配置不存在或无权限修改',
        } as ApiResponse<null>)
        return
      }

      res.json({
        success: true,
        data: config,
        message: '价格配置更新成功',
      } as ApiResponse<PriceConfig>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '更新价格配置失败',
      } as ApiResponse<null>)
    }
  }

  async deletePriceConfig(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const { id } = req.params
      const success = priceConfigService.deletePriceConfig(id, req.user.id)

      if (!success) {
        res.status(404).json({
          success: false,
          message: '价格配置不存在或无权限删除',
        } as ApiResponse<null>)
        return
      }

      res.json({
        success: true,
        message: '价格配置删除成功',
      } as ApiResponse<null>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '删除价格配置失败',
      } as ApiResponse<null>)
    }
  }
}

export const priceConfigController = new PriceConfigController()
