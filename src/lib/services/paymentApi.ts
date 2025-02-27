/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosClient from '../api/axiosClient'
import { ApiResponse } from '../types/base/Api'
import { PaymentResponse, VnPayPaymentRequest } from '../types/Payment'

interface VNPayReturnParams {
  vnp_Amount?: string
  vnp_BankCode?: string
  vnp_BankTranNo?: string
  vnp_CardType?: string
  vnp_OrderInfo?: string
  vnp_PayDate?: string
  vnp_ResponseCode?: string
  vnp_TmnCode?: string
  vnp_TransactionNo?: string
  vnp_TransactionStatus?: string
  vnp_TxnRef?: string
  vnp_SecureHash?: string
  [key: string]: string | undefined
}

const paymentApi = {
  getAllPayments: () =>
    axiosClient.get<ApiResponse<PaymentResponse[]>>('/payment'),

  createPayment: (data: VnPayPaymentRequest) =>
    axiosClient.post<ApiResponse<string>>('/payment/create-payment', data),

  processVnPayReturn: (params: VNPayReturnParams) =>
    axiosClient.get<ApiResponse<any>>('/payment/vnpay-return', {
      params
    })
}

export default paymentApi
