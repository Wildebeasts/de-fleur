export const OrderStatus = {
  PENDING: 'PENDING_PAYMENT',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  DELIVERY: 'DELIVERY',
  COMPLETED: 'COMPLETED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
  FAILED: 'PAYMENT_FAILED',
  EXPIRED: 'EXPIRED'
} as const

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus]
