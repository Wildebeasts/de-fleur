/* eslint-disable @typescript-eslint/no-unused-vars */
import axiosClient from '../api/axiosClient'
import { ApiResponse } from '../types/base/Api'
import {
  CouponCreateRequest,
  CouponResponse,
  CouponUpdateRequest
} from '../types/Coupon'

const couponApi = {
  getCoupons: (page = 1, pageSize = 10, searchText = '') =>
    axiosClient.get<ApiResponse<CouponResponse[]>>('/coupon/get-all-coupons'),
  getCouponByCode: (code: string) =>
    axiosClient.get<ApiResponse<CouponResponse>>(
      `/coupon/get-coupon-by-code/${code}`
    ),
  createCoupon: (request: CouponCreateRequest) =>
    axiosClient.post<ApiResponse<CouponResponse>>(
      '/coupon/create-coupon',
      request
    ),
  updateCoupon: (request: CouponUpdateRequest) =>
    axiosClient.put<ApiResponse<CouponResponse>>(
      '/coupon/update-coupon',
      request
    ),
  deleteCoupon: (id: string) =>
    axiosClient.delete<ApiResponse<CouponResponse>>(
      `/coupon/delete-coupon/${id}`
    )
}

export default couponApi
