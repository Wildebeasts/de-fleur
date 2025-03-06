/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import cartApi from '@/lib/services/cartApi'
import { Button } from '@/components/ui/button'

interface OrderSummaryProps {
  refreshTrigger?: number // Optional prop to trigger refresh
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ refreshTrigger = 0 }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [cartData, setCartData] = useState<any>(null)
  const navigate = useNavigate()

  // Fetch cart data directly from API
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setIsLoading(true)
        const response = await cartApi.getCurrentCart()
        if (response.data.isSuccess) {
          setCartData(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching cart:', error)
        toast.error('Không thể tải thông tin giỏ hàng')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCart()
  }, [refreshTrigger]) // Refetch when refreshTrigger changes

  const handleCheckout = () => {
    navigate({ to: '/checkout' })
  }

  // Calculate cart totals
  const getSubtotal = () => {
    if (!cartData || !cartData.items || !cartData.items.length) return 0
    return cartData.items.reduce(
      (total: number, item: any) => total + item.price * item.quantity,
      0
    )
  }

  // You can add shipping calculation logic here if needed
  const getShipping = () => {
    return 0 // Free shipping or calculate based on your business logic
  }

  const getTotal = () => {
    return getSubtotal() + getShipping()
  }

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
        <div className="animate-pulse">
          <div className="mb-4 h-4 w-full rounded bg-gray-200"></div>
          <div className="mb-4 h-4 w-3/4 rounded bg-gray-200"></div>
          <div className="mb-4 h-4 w-1/2 rounded bg-gray-200"></div>
          <div className="mt-6 h-10 w-full rounded bg-gray-200"></div>
        </div>
      </div>
    )
  }

  if (!cartData || !cartData.items || cartData.items.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
        <p className="mb-4 text-gray-500">Your cart is empty</p>
        <Button
          className="w-full rounded-full bg-[#3A4D39] py-3 text-white hover:bg-[#4A5D49]"
          onClick={() => navigate({ to: '/shop' })}
        >
          Continue Shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>{getSubtotal().toLocaleString('vi-VN')}₫</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span>
            {getShipping() === 0
              ? 'Free'
              : getShipping().toLocaleString('vi-VN') + '₫'}
          </span>
        </div>

        {/* You can add tax, discounts, etc. here */}

        <div className="border-t pt-3">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-lg text-[#3A4D39]">
              {getTotal().toLocaleString('vi-VN')}₫
            </span>
          </div>
        </div>
      </div>

      <Button
        className="mt-6 w-full rounded-full bg-[#3A4D39] py-6 text-white hover:bg-[#4A5D49]"
        onClick={handleCheckout}
        disabled={!cartData || !cartData.items || cartData.items.length === 0}
      >
        Proceed to Checkout
      </Button>
    </div>
  )
}

export default OrderSummary
