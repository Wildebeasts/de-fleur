/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import CartItem from '@/components/Cart/CartItem'

import cartApi from '@/lib/services/cartApi'
import { CartItem as CartItemType, CartResponse } from '@/lib/types/Cart'
import CartSummary from '@/components/Cart/CartSummary'

const ShoppingCartPage: React.FC = () => {
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string
    discount: number
    maxDiscountAmount: number | null
  } | null>(null)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    setIsLoading(true)
    try {
      const response = await cartApi.getCurrentCart()
      if (response.data.isSuccess) {
        setCart(response.data.data || null)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCouponApplied = (couponData: {
    id: string
    discount: number
    maxDiscountAmount: number | null
  }) => {
    setAppliedCoupon(couponData)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="mr-2 size-8 animate-spin text-[#3A4D39]" />
        <span>Loading your cart...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-center text-3xl font-bold text-[#3A4D39]">
          Your Shopping Cart
        </h1>

        {isLoading ? (
          <div>Loading cart...</div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <h2 className="mb-4 text-xl font-semibold">Your cart is empty</h2>
            <p className="mb-6 text-gray-600">
              Add products to your cart to continue shopping
            </p>
            <button
              onClick={() => navigate({ to: '/shop' })}
              className="rounded-full bg-[#3A4D39] px-6 py-2 text-white transition-colors hover:bg-[#4A5D49]"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[1fr_400px]">
            <div>
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <motion.div
                      key={item.cosmeticId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CartItem
                        item={item}
                        allItems={cart.items}
                        refreshCart={fetchCart}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <CartSummary cart={cart} onCouponApplied={handleCouponApplied} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShoppingCartPage
