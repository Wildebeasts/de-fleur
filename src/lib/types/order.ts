export interface CreateOrderRequest {
  cartId: string
  couponId?: string
  shippingAddress: string
  billingAddress: string
  paymentMethod: string
  currency: string
  wardCode: string
  districtId: number
}

export interface Cosmetics {
  [key: string]: number
}

export interface OrderWalkInRequest {
  Cosmetics: Cosmetics
  FirstName: string
  LastName: string
  CustomerPhoneNumber: string
  CouponId: string | null
  PaymentMethod: string
}

export interface CreateOrderResponse {
  orderId: string
  status: string
  paymentUrl: string
}

export interface OrderItemResponse {
  cosmeticId: string
  quantity: number
  sellingPrice: number
  subtotal: number // This will be calculated on the backend (sellingPrice * quantity)
}

export interface OrderResponse {
  id?: string
  customerId?: string
  couponId?: string
  subTotal?: number
  totalPrice?: number
  orderDate?: string
  shippingAddress?: string
  billingAddress?: string
  trackingNumber?: string
  deliveryDate?: string
  status?: string
  paymentUrl?: string
  invoice?: string
  createAt?: string
  createdBy?: string
  lastModified?: string
  lastModifiedBy?: string
  orderItems: OrderItemResponse[]
}
