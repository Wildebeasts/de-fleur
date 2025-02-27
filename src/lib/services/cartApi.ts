import axiosClient from '../api/axiosClient'
import { ApiResponse } from '../types/base/Api'
import {
  CartResponse,
  AddProductRequest,
  RemoveProductRequest
} from '@/lib/types/Cart'

const cartApi = {
  getAllCarts: () =>
    axiosClient.get<ApiResponse<CartResponse[]>>('/cart/carts'),

  viewCart: (cartId: string) =>
    axiosClient.get<ApiResponse<CartResponse>>(
      `/api/cart/view-cart?id=${cartId}`
    ),

  getCurrentUserCart: () =>
    axiosClient.get<ApiResponse<CartResponse>>('/cart/user-cart'),

  addToCart: (request: AddProductRequest) =>
    axiosClient.put<ApiResponse<CartResponse[]>>(
      '/api/cart/add-product',
      request
    ),

  removeFromCart: (request: RemoveProductRequest) =>
    axiosClient.put<ApiResponse<CartResponse[]>>(
      '/cart/delete-product',
      request
    )
}

export default cartApi
