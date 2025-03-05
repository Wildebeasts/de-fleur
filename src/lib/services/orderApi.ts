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
    axiosClient.post<ApiResponse<CreateOrderResponse>>('/orders', request),

  // Get current user's orders
  getMyOrders: () =>
    axiosClient.get<ApiResponse<OrderResponse[]>>('/orders/my'),

  // Complete order after payment
  completeOrder: (orderId: string, paymentStatus: string, paymentData: any) =>
    axiosClient.post<ApiResponse<OrderResponse>>(
      `/orders/${orderId}/complete`,
      paymentData,
      {
        params: { paymentStatus }
      }
    ),

  // Get all orders (Admin only)
  getAllOrders: () => axiosClient.get<ApiResponse<OrderResponse[]>>('/orders'),

  // Update order status (Admin only)
  updateOrderStatus: (orderId: string, request: { status: string }) =>
    axiosClient.put<ApiResponse<OrderResponse>>(
      `/orders/${orderId}/status`,
      request
    ),

  // Delete order (Admin only)
  deleteOrder: (orderId: string) =>
    axiosClient.delete<ApiResponse<string>>(`/orders/${orderId}`)
}

export default orderApi
