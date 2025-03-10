/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { debounce } from 'lodash'
import cartApi from '@/lib/services/cartApi'
import couponApi from '@/lib/services/couponApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDelivery } from '@/lib/context/DeliveryContext'
import { Loader2 } from 'lucide-react'

interface OrderSummaryProps {
  refreshTrigger?: number
  isCheckoutPage?: boolean
  initialCouponCode?: string
  onCouponApplied?: (couponId: string, discount: number) => void
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  refreshTrigger = 0,
  isCheckoutPage = false,
  initialCouponCode = '',
  onCouponApplied
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [cartData, setCartData] = useState<any>(null)
  const [couponCode, setCouponCode] = useState(initialCouponCode)
  const [coupon, setCoupon] = useState<any>(null)
  const [isCouponLoading, setIsCouponLoading] = useState(false)
  const [isCouponValid, setIsCouponValid] = useState(true)
  const { shippingFee } = useDelivery()
  const navigate = useNavigate()

  // Initialize coupon code from URL or localStorage
  useEffect(() => {
    // If initialCouponCode is provided, use it
    if (initialCouponCode) {
      setCouponCode(initialCouponCode)
      // Validate the initial coupon code
      debouncedCheckCoupon(initialCouponCode)
    } else {
      // Try to get from localStorage
      const savedCoupon = localStorage.getItem('cartCoupon')
      if (savedCoupon) {
        try {
          const { code, data } = JSON.parse(savedCoupon)
          setCouponCode(code)
          setCoupon(data)
          setIsCouponValid(true)

          // Notify parent component if we're on checkout page
          if (isCheckoutPage && onCouponApplied && data) {
            onCouponApplied(data.id, data.discount)
          }
        } catch (e) {
          localStorage.removeItem('cartCoupon')
        }
      }
    }
  }, [initialCouponCode, isCheckoutPage, onCouponApplied])

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

  // Debounced function to check coupon validity
  const debouncedCheckCoupon = useCallback(
    debounce(async (code: string) => {
      if (!code.trim()) {
        setCoupon(null)
        setIsCouponValid(true)
        localStorage.removeItem('cartCoupon')
        if (isCheckoutPage && onCouponApplied) {
          onCouponApplied('', 0)
        }
        return
      }

      try {
        setIsCouponLoading(true)
        const response = await couponApi.getCouponByCode(code)

        if (response.data.isSuccess && response.data.data) {
          const couponData = response.data.data
          setCoupon(couponData)
          setIsCouponValid(true)

          // Save to localStorage for persistence between pages
          localStorage.setItem(
            'cartCoupon',
            JSON.stringify({
              code,
              data: couponData
            })
          )

          // Notify parent component if we're on checkout page
          if (isCheckoutPage && onCouponApplied) {
            onCouponApplied(couponData.id, couponData.discount)
          }

          toast.success('Mã giảm giá hợp lệ')
        } else {
          setCoupon(null)
          setIsCouponValid(false)
          localStorage.removeItem('cartCoupon')

          if (isCheckoutPage && onCouponApplied) {
            onCouponApplied('', 0)
          }

          toast.error('Mã giảm giá không hợp lệ')
        }
      } catch (error) {
        console.error('Error validating coupon:', error)
        setCoupon(null)
        setIsCouponValid(false)
        localStorage.removeItem('cartCoupon')

        if (isCheckoutPage && onCouponApplied) {
          onCouponApplied('', 0)
        }

        toast.error('Không thể kiểm tra mã giảm giá')
      } finally {
        setIsCouponLoading(false)
      }
    }, 800),
    [isCheckoutPage, onCouponApplied]
  )

  // Handle coupon input change
  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCouponCode(value)

    if (value.trim()) {
      setIsCouponLoading(true)
      debouncedCheckCoupon(value)
    } else {
      setCoupon(null)
      setIsCouponValid(true)
      localStorage.removeItem('cartCoupon')

      if (isCheckoutPage && onCouponApplied) {
        onCouponApplied('', 0)
      }
    }
  }

  const handleCheckout = () => {
    navigate({ to: '/checkout' })
  }

  // Calculate cart totals
  const getSubtotal = () => {
    if (!cartData || !cartData.items || !cartData.items.length) return 0
    return (
      cartData.originalTotalPrice ||
      cartData.items.reduce(
        (total: number, item: any) => total + item.price * item.quantity,
        0
      )
    )
  }

  // Get event discount amount
  const getEventDiscount = () => {
    if (!cartData || !cartData.eventDiscountTotal) return 0
    return cartData.eventDiscountTotal
  }

  // Get coupon discount amount
  const getCouponDiscount = () => {
    if (!coupon || !isCouponValid) return 0

    // Calculate based on coupon type (percentage or fixed amount)
    const subtotalAfterEventDiscount = getSubtotal() - getEventDiscount()

    if (coupon.discount) {
      // Assuming discount is a percentage
      return Math.round(subtotalAfterEventDiscount * (coupon.discount / 100))
    }

    return 0
  }

  // You can add shipping calculation logic here if needed
  const getShipping = () => {
    return shippingFee?.total || 0 // Free shipping or calculate based on your business logic
  }

  const getTotal = () => {
    // Start with the cart total (after event discounts)
    let total = 0

    // If we have the new totalPrice that includes event discounts, use it
    if (cartData && cartData.totalPrice) {
      total = cartData.totalPrice
    } else {
      // Otherwise fall back to the old calculation
      total = getSubtotal() - getEventDiscount()
    }

    // Apply coupon discount if valid
    total -= getCouponDiscount()

    // Add shipping
    total += getShipping()

    return total
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

        {/* Add event discount section if there is a discount */}
        {getEventDiscount() > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Event Discount</span>
            <span>-{getEventDiscount().toLocaleString('vi-VN')}₫</span>
          </div>
        )}

        {/* Add coupon discount section if there is a valid coupon */}
        {coupon && isCouponValid && getCouponDiscount() > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Coupon Discount ({couponCode})</span>
            <span>-{getCouponDiscount().toLocaleString('vi-VN')}₫</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span>
            {shippingFee
              ? `${getShipping().toLocaleString('vi-VN')}₫`
              : 'Calculating...'}
          </span>
        </div>

        {/* Coupon input section */}
        <div className="mt-4 border-t pt-4">
          <div className="mb-2 text-sm font-medium">Coupon Code</div>
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={handleCouponChange}
              className={`pr-10 ${!isCouponValid && couponCode ? 'border-red-500' : ''}`}
            />
            {isCouponLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="size-4 animate-spin text-gray-400" />
              </div>
            )}
          </div>
          {!isCouponValid && couponCode && (
            <p className="mt-1 text-xs text-red-500">Invalid coupon code</p>
          )}
          {coupon && isCouponValid && (
            <p className="mt-1 text-xs text-green-600">
              Coupon applied: {coupon.discount}% off
            </p>
          )}
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-lg text-[#3A4D39]">
              {getTotal().toLocaleString('vi-VN')}₫
            </span>
          </div>
        </div>
      </div>

      {!isCheckoutPage && (
        <Button
          className="mt-6 w-full rounded-full bg-[#3A4D39] py-6 text-white hover:bg-[#4A5D49]"
          onClick={handleCheckout}
          disabled={
            !cartData ||
            !cartData.items ||
            cartData.items.length === 0 ||
            (couponCode.trim() !== '' && !isCouponValid) ||
            isCouponLoading
          }
        >
          Proceed to Checkout
        </Button>
      )}
    </div>
  )
}

export default OrderSummary
