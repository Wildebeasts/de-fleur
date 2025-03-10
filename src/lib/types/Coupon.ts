export interface CouponResponse {
  id: string
  code: string | null
  discount: number
  expiryDate: string
  usageLimit: number
}
