export interface CouponResponse {
  id: string
  code: string
  discount: number
  expiryDate: Date
  usageLimit: number
}
