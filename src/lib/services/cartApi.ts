import axiosClient from '../api/axiosClient'
import { ApiResponse } from '../types/base/Api'
import {
  CartResponse,
  AddProductRequest,
  UpdateCartRequest
} from '../types/Cart'

const cartApi = {
  getAllCarts: () => axiosClient.get<ApiResponse<CartResponse[]>>('/cart'),

  viewCart: (cartId: string) =>
    axiosClient.get<ApiResponse<CartResponse>>(`/cart/${cartId}`),

  getCurrentCart: () =>
    axiosClient.get<ApiResponse<CartResponse>>('/api/cart/me'),

  addToCart: (request: AddProductRequest) =>
    axiosClient.put<ApiResponse<CartResponse>>('/api/cart/me/items', request),

  updateCart: (request: UpdateCartRequest) =>
    axiosClient.put<ApiResponse<CartResponse>>('/api/cart/me', request),

  removeFromCart: (cartId: string, cosmeticId: string) =>
    axiosClient.delete<ApiResponse<CartResponse>>(
      `/api/cart/${cartId}/items/${cosmeticId}`
    )
}

export default cartApi
