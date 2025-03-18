export interface CouponResponse {
  id: string
  name: string
  code: string
  discount: number
  startDate: Date
  expiryDate: Date
  usageLimit: number
  maxDiscountAmount: number
  minimumOrderPrice: number
}

export interface CouponCreateRequest {
  name: string
  code: string
  discount: number
  expiryDate: Date
  usageLimit: number
  maxDiscountAmount: number
  minimumOrderPrice: number
}

export interface CouponUpdateRequest {
  code: string
  discount: number
  expiryDate: Date
  usageLimit: number
  maxDiscountAmount: number
  minimumOrderPrice: number
}
