import axiosClient from '../context/axiosClient'
import { ApiResponse } from '../types/base/Api'
import { CartResponse, AddProductRequest } from '@/lib/types/Cart'

const cartApi = {
  getAllCarts: () => axiosClient.get<ApiResponse<CartResponse[]>>('/cart'),

  viewCart: (cartId: string) =>
    axiosClient.get<ApiResponse<CartResponse>>(`/cart/${cartId}`),

  getCurrentUserCart: () =>
    axiosClient.get<ApiResponse<CartResponse>>('/cart/me'),
  addToCart: (cartId: string, request: AddProductRequest) =>
    axiosClient.put<ApiResponse<CartResponse[]>>(
      `/cart/${cartId}/items`,
      request
    ),

  removeFromCart: (cartId: string, cosmeticId: string) =>
    axiosClient.delete<ApiResponse<CartResponse[]>>(
      `/cart/${cartId}/items/${cosmeticId}`
    )
}

export default cartApi
