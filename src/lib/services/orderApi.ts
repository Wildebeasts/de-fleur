/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosClient from '../api/axiosClient'
import { ApiResponse } from '../types/base/Api'
import {
  CreateOrderRequest,
  OrderResponse,
  CreateOrderResponse
} from '../types/order'

const orderApi = {
  // Create new order
  createOrder: (request: CreateOrderRequest) =>
    axiosClient.post<ApiResponse<CreateOrderResponse>>('/api/orders', request),

  // Get current user's orders
  getMyOrders: () =>
    axiosClient.get<ApiResponse<OrderResponse[]>>('/api/orders/my'),

  // Complete order after payment
  completeOrder: (orderId: string, paymentStatus: string, paymentData: any) =>
    axiosClient.post<ApiResponse<OrderResponse>>(
      `/api/orders/${orderId}/complete`,
      paymentData,
      {
        params: { paymentStatus }
      }
    )
}

export default orderApi
