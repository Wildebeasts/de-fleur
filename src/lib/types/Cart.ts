/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CartCustomer {
  id: string
  userName: string
  email: string
}

// de-fleur/src/lib/types/Cart.ts
export interface CartItem {
  cosmeticId: string
  cosmeticName: string
  cosmeticImage: string
  price: number // Original price
  discountedPrice: number // Price after event discount
  discountPercentage: number // Event discount percentage
  quantity: number
  subtotal: number // Original subtotal (price * quantity)
  discountedSubtotal: number // Discounted subtotal (discountedPrice * quantity)
  weight: number
  length: number
  width: number
  height: number
}

export interface CartResponse {
  id: string
  totalPrice: number // Final price after discounts
  originalTotalPrice: number // Total before discounts
  eventDiscountTotal: number // Total discount amount
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
