import axiosClient from '../api/axiosClient'
import { ApiResponse } from '../types/base/Api'
import { CouponResponse } from '../types/Coupon'

const couponApi = {
  getCouponByCode: (code: string) =>
    axiosClient.get<ApiResponse<CouponResponse>>(
      `/coupon/get-coupon-by-code/${code}`
    ),

  getAllCoupons: async () => {
    const response = await axiosClient.get<ApiResponse<CouponResponse[]>>(
      '/coupon/get-all-coupons'
    )
    return response.data
  },

  deleteCoupon: async (id: string) => {
    const response = await axiosClient.delete<ApiResponse<void>>(
      `/coupon/delete-coupon/${id}`
    )
    return response.data
  },

  createCoupon: async (couponData: Partial<CouponResponse>) => {
    const response = await axiosClient.post<ApiResponse<CouponResponse>>(
      'coupon/create-coupon',
      couponData
    )
    return response.data
  },

  updateCoupon: async (id: string, couponData: Partial<CouponResponse>) => {
    const response = await axiosClient.put<ApiResponse<CouponResponse>>(
      '/coupon/update-coupon',
      {
        id,
        code: couponData.code,
        discount: couponData.discount,
        expiryDate: couponData.expiryDate,
        usageLimit: couponData.usageLimit
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data
  }
}

export default couponApi
