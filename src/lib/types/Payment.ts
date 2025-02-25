export interface PaymentResponse {
  id: string
  name: string
  description: string
}

export interface VnPayPaymentRequest {
  orderId: string
  paymentMethod: string
  amount: number
}

export interface VnPayPaymentResponse {
  success: boolean
  orderDescription?: string
  transactionId: string
  transactionOrderId?: string
  paymentMethod?: string
  paymentId?: string
  totalAmount?: string
  token?: string
  responseCode?: string
}
