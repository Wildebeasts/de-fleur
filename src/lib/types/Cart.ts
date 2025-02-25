/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CartItem {
  cartId: string
  cosmeticId: string
  quantity: number
  cosmetic?: {
    id: string
    name: string
    price: number
    cosmeticImages: string[]
    ingredients: string
    cosmeticType: string
    brand: string
  }
}

export interface CartResponse {
  id: string
  totalPrice: number
  customer: any
  items: CartItem[]
}

export interface AddProductRequest {
  cartId: string
  cosmeticId: string
  quantity: number
}

export interface RemoveProductRequest {
  cartId: string
  cosmeticId: string
}
