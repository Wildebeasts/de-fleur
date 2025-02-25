/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import cartApi from '@/lib/services/cartApi'
import {
  CartItem as BackendCartItem,
  AddProductRequest
} from '@/lib/types/Cart'
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

// Cart provider component
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

  // Load cart from localStorage or server when component mounts
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated && accessToken) {
        try {
          // Get cart for the current user
          const response = await cartApi.getCurrentUserCart()
          const userCart = response.data.data

          if (userCart) {
            setCartId(userCart.id)

            // Transform backend cart items to frontend format
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
          } else {
            // If no cart exists yet, it will be created by the backend
            console.log('No cart found for user')
          }
        } catch (error) {
          console.error('Failed to load cart from server:', error)
          // Fall back to localStorage
          const storedCart = localStorage.getItem('cart')
          if (storedCart) {
            setCartItems(JSON.parse(storedCart))
          }
        }
      } else {
        // For non-authenticated users, use localStorage
        const storedCart = localStorage.getItem('cart')
        if (storedCart) {
          setCartItems(JSON.parse(storedCart))
        }
      }
    }

    loadCart()
  }, [isAuthenticated, accessToken])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  // Add item to cart
  const addToCart = async (item: CartItem) => {
    if (isAuthenticated && userId && cartId) {
      try {
        // Add to server-side cart
        const request: AddProductRequest = {
          cartId: cartId,
          cosmeticId: item.id,
          quantity: item.quantity
        }

        await cartApi.addToCart(request)

        // Update local state after server update succeeds
        setCartItems((prevItems) => {
          const existingItemIndex = prevItems.findIndex(
            (cartItem) => cartItem.id === item.id
          )

          if (existingItemIndex >= 0) {
            const updatedItems = [...prevItems]
            updatedItems[existingItemIndex].quantity += item.quantity
            return updatedItems
          } else {
            return [...prevItems, item]
          }
        })
      } catch (error) {
        console.error('Failed to add item to cart on server:', error)
      }
    } else {
      // For non-authenticated users, just update localStorage
      setCartItems((prevItems) => {
        const existingItemIndex = prevItems.findIndex(
          (cartItem) => cartItem.id === item.id
        )

        if (existingItemIndex >= 0) {
          const updatedItems = [...prevItems]
          updatedItems[existingItemIndex].quantity += item.quantity
          return updatedItems
        } else {
          return [...prevItems, item]
        }
      })
    }
  }

  // Remove item from cart
  const removeFromCart = async (id: string) => {
    if (isAuthenticated && userId && cartId) {
      try {
        // Remove from server-side cart
        await cartApi.removeFromCart({
          cartId: cartId,
          cosmeticId: id
        })

        // Update local state after server update succeeds
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== id))
      } catch (error) {
        console.error('Failed to remove item from cart on server:', error)
      }
    } else {
      // For non-authenticated users, just update localStorage
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id))
    }
  }

  // Update item quantity
  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id)
      return
    }

    if (isAuthenticated && userId && cartId) {
      try {
        // First remove the item
        await cartApi.removeFromCart({
          cartId: cartId,
          cosmeticId: id
        })

        // Then add it back with the new quantity
        const item = cartItems.find((item) => item.id === id)
        if (item) {
          await cartApi.addToCart({
            cartId: cartId,
            cosmeticId: id,
            quantity: quantity
          })
        }

        // Update local state
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.id === id ? { ...item, quantity } : item
          )
        )
      } catch (error) {
        console.error('Failed to update item quantity on server:', error)
      }
    } else {
      // For non-authenticated users, just update localStorage
      setCartItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      )
    }
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
