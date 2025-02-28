import axiosClient from '@/lib/context/axiosClient'
import { ApiResponse } from '../types/base/Api'
import {
  PaymentResponse,
  VnPayPaymentRequest,
  VnPayPaymentResponse
} from '../types/Payment'

const paymentApi = {
  getAllPayments: () =>
    axiosClient.get<ApiResponse<PaymentResponse[]>>('/payment'),

  createPayment: (data: VnPayPaymentRequest) =>
    axiosClient.post<ApiResponse<string>>('/payment/create-payment', data),

  processVnPayReturn: (params: Record<string, string>) =>
    axiosClient.get<ApiResponse<VnPayPaymentResponse>>(
      '/payment/vnpay-return',
      { params }
    )
}

export default paymentApi
