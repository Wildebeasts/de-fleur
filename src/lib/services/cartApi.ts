import axiosClient from '../api/axiosClient'
import { ApiResponse } from '@/lib/types/base/Api'
import {
  CartResponse,
  AddProductRequest,
  UpdateCartItemDto
} from '@/lib/types/Cart'

const cartApi = {
  // Get current user's cart
  getCurrentCart: () => axiosClient.get<ApiResponse<CartResponse>>('/cart/me'),

  // Get cart by ID (admin)
  getCartById: (cartId: string) =>
    axiosClient.get<ApiResponse<CartResponse>>(`/cart/${cartId}`),

  // Get all carts (admin)
  getAllCarts: () => axiosClient.get<ApiResponse<CartResponse[]>>('/cart'),

  // This method is for adding a new item to cart (incrementing quantity)
  addToCart: (cosmeticId: string, quantity: number) =>
    axiosClient.put<ApiResponse<CartResponse>>('/cart/me/items', {
      cosmeticId,
      quantity
    } as AddProductRequest),

  // This method is for updating the entire cart with absolute quantities
  updateCart: (items: UpdateCartItemDto[]) =>
    axiosClient.put<ApiResponse<CartResponse>>('/cart/me', items),

  // Remove cart item for current user
  removeCartItem: (cosmeticId: string) =>
    axiosClient.delete<ApiResponse<CartResponse>>(
      `/cart/me/items/${cosmeticId}`
    ),

  // Remove cart item (admin)
  removeCartItemAdmin: (cartId: string, cosmeticId: string) =>
    axiosClient.delete<ApiResponse<CartResponse[]>>(
      `/cart/${cartId}/items/${cosmeticId}`
    )
}

export default cartApi
