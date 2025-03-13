/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosClient from '../api/axiosClient'
import { ApiResponse } from '../types/base/Api'
import {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderResponse,
  OrderWalkInRequest
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
    axiosClient.delete<ApiResponse<string>>(`/orders/${orderId}`),

  // Get order by ID
  getOrderById: (orderId: string) =>
    axiosClient.get<ApiResponse<OrderResponse>>(`/orders/${orderId}`),

  // Create a Walk In Order
  createWalkInOrder: (request: OrderWalkInRequest) =>
    axiosClient.post<ApiResponse<OrderResponse>>('/orders/walkin', request),

  // Cancel order (updates status to CANCELLED)
  cancelOrder: (orderId: string) =>
    axiosClient.put<ApiResponse<OrderResponse>>(`/orders/${orderId}/status`, {
      status: 'CANCELLED'
    })
}

export default orderApi
