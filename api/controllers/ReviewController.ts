import type { Request, Response } from 'express'
import type { ApiResponse, Review, CreateReviewRequest } from '../../shared/types.js'
import { reviewService } from '../services/index.js'

export class ReviewController {
  async getReviewsByVenue(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { page = '1', pageSize = '10' } = req.query

      const result = reviewService.getReviewsByVenue(
        id,
        parseInt(page as string, 10),
        parseInt(pageSize as string, 10)
      )

      res.json({
        success: true,
        data: result.reviews,
        total: result.total,
      } as ApiResponse<Review[]>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取评价列表失败',
      } as ApiResponse<null>)
    }
  }

  async createReview(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const data = req.body as CreateReviewRequest

      if (!data.bookingId || !data.venueId || !data.rating || !data.content) {
        res.status(400).json({
          success: false,
          message: '请填写完整的评价信息',
        } as ApiResponse<null>)
        return
      }

      if (data.rating < 1 || data.rating > 5) {
        res.status(400).json({
          success: false,
          message: '评分必须在1-5之间',
        } as ApiResponse<null>)
        return
      }

      const review = reviewService.createReview(req.user.id, data)

      if (!review) {
        res.status(400).json({
          success: false,
          message: '无法创建评价，请检查预订状态',
        } as ApiResponse<null>)
        return
      }

      res.status(201).json({
        success: true,
        data: review,
        message: '评价创建成功',
      } as ApiResponse<Review>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '创建评价失败',
      } as ApiResponse<null>)
    }
  }

  async replyToReview(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '需要登录',
        } as ApiResponse<null>)
        return
      }

      const { id } = req.params
      const { reply } = req.body as { reply: string }

      if (!reply || !reply.trim()) {
        res.status(400).json({
          success: false,
          message: '回复内容不能为空',
        } as ApiResponse<null>)
        return
      }

      const review = reviewService.replyToReview(id, req.user.id, reply)

      if (!review) {
        res.status(404).json({
          success: false,
          message: '评价不存在或无权限回复',
        } as ApiResponse<null>)
        return
      }

      res.json({
        success: true,
        data: review,
        message: '回复成功',
      } as ApiResponse<Review>)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '回复评价失败',
      } as ApiResponse<null>)
    }
  }
}

export const reviewController = new ReviewController()
