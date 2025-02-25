import axiosClient from '../context/axiosClient'
import { ApiResponse } from '../types/base/Api'
import {
  CartResponse,
  AddProductRequest,
  RemoveProductRequest
} from '@/lib/types/Cart'

const cartApi = {
  getAllCarts: () =>
    axiosClient.get<ApiResponse<CartResponse[]>>('/api/cart/carts'),

  viewCart: (cartId: string) =>
    axiosClient.get<ApiResponse<CartResponse>>(
      `/api/cart/view-cart?id=${cartId}`
    ),

  getCartByUserId: (userId: string) =>
    axiosClient.get<ApiResponse<CartResponse>>(`/api/cart/user/${userId}`),

  addToCart: (request: AddProductRequest) =>
    axiosClient.put<ApiResponse<CartResponse[]>>(
      '/api/cart/add-product',
      request
    ),

  removeFromCart: (request: RemoveProductRequest) =>
    axiosClient.put<ApiResponse<CartResponse[]>>(
      '/api/cart/delete-product',
      request
    )
}

export default cartApi
