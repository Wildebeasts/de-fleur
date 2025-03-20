/* eslint-disable @typescript-eslint/no-unused-vars */
import axiosClient from '../api/axiosClient'
import { ApiResponse } from '../types/base/Api'
import {
  CouponCreateRequest,
  CouponResponse,
  CouponUpdateRequest,
  ExchangeCouponRequest,
  GamePointRequest,
  GamePointResponse
} from '../types/Coupon'

const couponApi = {
  getAll: () => axiosClient.get<ApiResponse<CouponResponse[]>>('/coupons'),

  getById: (id: string) =>
    axiosClient.get<ApiResponse<CouponResponse>>(`/coupons/${id}`),

  getByCode: (code: string) =>
    axiosClient.get<ApiResponse<CouponResponse>>(`/coupons/code/${code}`),

  create: (request: CouponCreateRequest) =>
    axiosClient.post<ApiResponse<CouponResponse>>('/coupons', request),

  update: (id: string, request: CouponUpdateRequest) =>
    axiosClient.put<ApiResponse<CouponResponse>>(`/coupons/${id}`, request),

  delete: (id: string) =>
    axiosClient.delete<ApiResponse<CouponResponse>>(`/coupons/${id}`),
  // New game-related endpoints
  exchangeCoupon: async (request: ExchangeCouponRequest) => {
    return await axiosClient.post<ApiResponse<CouponResponse>>(
      '/coupons/exchange',
      request
    )
  },

  startGame: async () => {
    return await axiosClient.get<ApiResponse<string>>('/coupons/game')
  },

  processGamePoints: async (request: GamePointRequest) => {
    return await axiosClient.post<ApiResponse<GamePointResponse>>(
      '/coupons/game',
      request
    )
  }
}

export default couponApi
