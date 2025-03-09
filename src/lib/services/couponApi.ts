import axiosClient from '../api/axiosClient'
import { ApiResponse } from '../types/base/Api'
import { CouponResponse } from '../types/Coupon'

const couponApi = {
  getCouponByCode: (code: string) =>
    axiosClient.get<ApiResponse<CouponResponse>>(
      `/coupon/get-coupon-by-code/${code}`
    )
}

export default couponApi
