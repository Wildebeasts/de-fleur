export interface CouponResponse {
  id: string
  name: string
  code: string
  discount: number
  startDate: Date
  expiryDate: Date
  usageLimit: number
}

export interface CouponCreateRequest {
  name: string
  code: string
  discount: number
  expiryDate: Date
  usageLimit: number
}

export interface CouponUpdateRequest {
  id: string
  code: string
  discount: number
  expiryDate: Date
  usageLimit: number
}
