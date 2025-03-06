/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CartCustomer {
  id: string
  userName: string
  email: string
}

export interface CartItem {
  cosmeticId: string
  cosmeticName: string
  cosmeticImage: string
  price: number
  quantity: number
  subtotal: number
  weight: number
  length: number
  width: number
  height: number
}

export interface CartResponse {
  id: string
  totalPrice: number
  customer: {
    id: string
    userName: string
    email: string
  }
  items: CartItem[]
}

export interface AddProductRequest {
  cosmeticId: string
  quantity: number
}

export interface UpdateCartItemDto {
  cosmeticId: string
  quantity: number
}

export interface UpdateCartRequest {
  cartId: string
  items: UpdateCartItemDto[]
}
