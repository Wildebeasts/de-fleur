/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import cartApi from '@/lib/services/cartApi'
import { AddProductRequest } from '@/lib/types/Cart'
import { jwtDecode } from 'jwt-decode'

// Frontend cart item structure
export interface CartItem {
  id: string // CosmeticId in the backend
  name: string
  price: number
  quantity: number
  // Additional fields useful for UI display
  imageUrl?: string
  ingredients?: string
  cosmeticType?: string
  brand?: string
  cosmeticImages?: string[]
}

// Define the context type
interface CartContextType {
  cartItems: CartItem[]
  cartId: string | null
  addToCart: (item: CartItem) => Promise<void>
  removeFromCart: (id: string) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  clearCart: () => void
  getCartTotal: () => number
  getSubtotal: () => number
  getItemCount: () => number
  applyCoupon: (couponCode: string) => void
  removeCoupon: () => void
  coupon: { code: string; discountAmount: number } | null
  shippingAddress: string
  billingAddress: string
  setShippingAddress: (address: string) => void
  setBillingAddress: (address: string) => void
  createOrderRequest: () => any
}

// Interface for decoded JWT token
interface DecodedToken {
  nameid: string // Usually contains the user ID
  unique_name?: string
  email?: string
  exp: number
  // Add any other claims your JWT contains
}

// Create the context with default values
const CartContext = createContext<CartContextType>({
  cartItems: [],
  cartId: null,
  addToCart: async () => { },
  removeFromCart: async () => { },
  updateQuantity: async () => { },
  clearCart: () => { },
  getCartTotal: () => 0,
  getSubtotal: () => 0,
  getItemCount: () => 0,
  applyCoupon: () => { },
  removeCoupon: () => { },
  coupon: null,
  shippingAddress: '',
  billingAddress: '',
  setShippingAddress: () => { },
  setBillingAddress: () => { },
  createOrderRequest: () => ({})
})

// Hook to use the cart context
export const useCart = () => useContext(CartContext)

const CART_STORAGE_KEY = 'guest-cart'

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartId, setCartId] = useState<string | null>(null)
  const [coupon, setCoupon] = useState<{
    code: string
    discountAmount: number
  } | null>(null)
  const [shippingAddress, setShippingAddress] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  const { isAuthenticated, accessToken } = useAuth()

  // Decode token to get user ID
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(accessToken)
        setUserId(decoded.nameid)
      } catch (error) {
        console.error('Failed to decode token:', error)
      }
    } else {
      setUserId(null)
    }
  }, [isAuthenticated, accessToken])

  // Load cart when component mounts or auth state changes
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated && accessToken) {
        try {
          // Get cart for authenticated user from server
          const response = await cartApi.getCurrentUserCart()
          const userCart = response.data.data

          if (userCart) {
            setCartId(userCart.id)
            const items: CartItem[] = userCart.items.map((item) => ({
              id: item.cosmeticId,
              name: item.cosmetic?.name || 'Unknown Product',
              price: item.cosmetic?.price || 0,
              quantity: item.quantity,
              cosmeticImages: item.cosmetic?.cosmeticImages,
              ingredients: item.cosmetic?.ingredients,
              cosmeticType: item.cosmetic?.cosmeticType,
              brand: item.cosmetic?.brand
            }))
            setCartItems(items)

            // Clear guest cart after successful login and cart fetch
            localStorage.removeItem(CART_STORAGE_KEY)
          }
        } catch (error) {
          console.error('Failed to load cart from server:', error)
          loadGuestCart() // Fallback to guest cart if server fails
        }
      } else {
        // Load guest cart for non-authenticated users
        loadGuestCart()
      }
    }

    loadCart()
  }, [isAuthenticated, accessToken])

  // Save guest cart to localStorage whenever it changes
  useEffect(() => {
    if (!isAuthenticated) {
      //console.log('Saving guest cart:', cartItems) // Debug log
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))

      // Verify storage
      //const stored = localStorage.getItem(CART_STORAGE_KEY)
      //console.log('Verified stored cart:', stored) // Debug log
    }
  }, [cartItems, isAuthenticated])

  // Helper function to load guest cart from localStorage
  const loadGuestCart = () => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY)
    //console.log('Loading guest cart:', storedCart) // Debug log
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart)
        setCartItems(parsedCart)
      } catch (error) {
        console.error('Failed to parse guest cart:', error)
        setCartItems([])
      }
    }
  }

  // Add item to cart
  const addToCart = async (item: CartItem) => {
    //console.log('Adding item to cart:', item) // Debug log
    if (isAuthenticated && userId && cartId) {
      try {
        const request: AddProductRequest = {
          cartId: cartId,
          cosmeticId: item.id,
          quantity: item.quantity
        }
        await cartApi.addToCart(cartId, request)
      } catch (error) {
        console.error('Failed to add item to cart on server:', error)
        return
      }
    }

    // Update local state for both authenticated and guest users
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (cartItem) => cartItem.id === item.id
      )

      let newItems
      if (existingItemIndex >= 0) {
        newItems = [...prevItems]
        newItems[existingItemIndex].quantity += item.quantity
      } else {
        newItems = [...prevItems, item]
      }

      //console.log('Updated cart items:', newItems) // Debug log
      return newItems
    })
  }

  // Remove item from cart
  const removeFromCart = async (id: string) => {
    if (isAuthenticated && userId && cartId) {
      try {
        await cartApi.removeFromCart(cartId, id)
      } catch (error) {
        console.error('Failed to remove item from cart on server:', error)
        return
      }
    }

    // Update local state for both authenticated and guest users
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  // Update item quantity
  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id)
      return
    }

    if (isAuthenticated && userId && cartId) {
      try {
        await cartApi.removeFromCart(cartId, id)
        const item = cartItems.find((item) => item.id === id)
        if (item) {
          await cartApi.addToCart(cartId, {
            cartId: cartId,
            cosmeticId: id,
            quantity: quantity
          })
        }
      } catch (error) {
        console.error('Failed to update item quantity on server:', error)
        return
      }
    }

    // Update local state for both authenticated and guest users
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }

  // Clear cart
  const clearCart = () => {
    // For simplicity, we're just clearing the local state
    // In a real app, you would also clear the server-side cart
    setCartItems([])
  }

  // Calculate subtotal
  const getSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  }

  // Calculate total with discount
  const getCartTotal = () => {
    const subtotal = getSubtotal()
    const discount = coupon ? coupon.discountAmount : 0
    return Math.max(subtotal - discount, 0)
  }

  // Get item count
  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  // Apply coupon
  const applyCoupon = (couponCode: string) => {
    // In a real app, you would validate the coupon with your API
    setCoupon({ code: couponCode, discountAmount: 10 })
  }

  // Remove coupon
  const removeCoupon = () => {
    setCoupon(null)
  }

  // Create order request
  const createOrderRequest = () => {
    return {
      customerId: userId || 'guest',
      couponId: coupon?.code,
      subtotal: getSubtotal(),
      totalPrice: getCartTotal(),
      shippingAddress,
      billingAddress,
      orderItems: cartItems.map((item) => ({
        cosmeticId: item.id,
        quantity: item.quantity
      }))
    }
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartId,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getSubtotal,
        getItemCount,
        applyCoupon,
        removeCoupon,
        coupon,
        shippingAddress,
        billingAddress,
        setShippingAddress,
        setBillingAddress,
        createOrderRequest
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
