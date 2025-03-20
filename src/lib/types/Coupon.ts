export interface CouponResponse {
  id: string
  name: string
  code: string
  discount: number
  startDate: string
  expiryDate: string
  usageLimit: number
  maxDiscountAmount: number
  minimumOrderPrice: number
  pointRequired?: number
}

export interface CouponCreateRequest {
  name: string
  code: string
  discount: number
  expiryDate: Date
  usageLimit: number
  maxDiscountAmount: number
  minimumOrderPrice: number
  pointRequired: number
}

export interface CouponUpdateRequest {
  code: string
  discount: number
  expiryDate: Date
  usageLimit: number
  maxDiscountAmount?: number
  minimumOrderPrice?: number
}

export interface ExchangeCouponRequest {
  couponId: string
}

export interface GamePointRequest {
  points: number
}

export interface GamePointResponse {
  userPoints: number
}

export interface UserCouponResponse {
  userId: string
  couponId: string
  coupon: CouponResponse
  quantity: number
}
