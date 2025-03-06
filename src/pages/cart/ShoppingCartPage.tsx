/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import CartItem from '@/components/Cart/CartItem'
import OrderSummary from '@/components/Cart/OrderSummary'
import cartApi from '@/lib/services/cartApi'
import { CartItem as CartItemType } from '@/lib/types/Cart'

const ShoppingCartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItemType[]>([])
  const [cartId, setCartId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const navigate = useNavigate()

  // Fetch cart data
  useEffect(() => {
    fetchCart()
  }, [refreshTrigger])

  const fetchCart = async () => {
    try {
      setIsLoading(true)
      const response = await cartApi.getCurrentCart()

      if (response.data.isSuccess) {
        setCartItems(response.data.data?.items || [])
        setCartId(response.data.data?.id || null)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      toast.error('Không thể tải giỏ hàng')
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh cart data
  const refreshCart = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  // Navigate to checkout
  const handleCheckout = () => {
    navigate({ to: '/checkout' })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="mr-2 size-8 animate-spin text-[#3A4D39]" />
        <span>Đang tải giỏ hàng...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-center text-3xl font-bold text-[#3A4D39]">
          Giỏ hàng của bạn
        </h1>

        {cartItems.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <h2 className="mb-4 text-xl font-semibold">
              Giỏ hàng của bạn đang trống
            </h2>
            <p className="mb-6 text-gray-600">
              Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
            </p>
            <button
              onClick={() => navigate({ to: '/shop' })}
              className="rounded-full bg-[#3A4D39] px-6 py-2 text-white transition-colors hover:bg-[#4A5D49]"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.cosmeticId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CartItem
                        item={item}
                        allItems={cartItems}
                        refreshCart={refreshCart}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <OrderSummary refreshTrigger={refreshTrigger} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShoppingCartPage
