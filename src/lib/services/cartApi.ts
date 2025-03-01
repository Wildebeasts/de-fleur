import axiosClient from '../api/axiosClient'
import { ApiResponse } from '../types/base/Api'
import { CartResponse, AddProductRequest } from '@/lib/types/Cart'

const cartApi = {
  getAllCarts: () => axiosClient.get<ApiResponse<CartResponse[]>>('/api/cart'),

  viewCart: (cartId: string) =>
    axiosClient.get<ApiResponse<CartResponse>>(`/api/cart/${cartId}`),

  getCurrentUserCart: () =>
    axiosClient.get<ApiResponse<CartResponse>>('/api/cart/me'),

  addToCart: (cartId: string, request: AddProductRequest) =>
    axiosClient.put<ApiResponse<CartResponse[]>>(
      `/api/cart/${cartId}/items`,
      request
    ),

  removeFromCart: (cartId: string, cosmeticId: string) =>
    axiosClient.delete<ApiResponse<CartResponse[]>>(
      `/api/cart/${cartId}/items/${cosmeticId}`
    )
}

export default cartApi
