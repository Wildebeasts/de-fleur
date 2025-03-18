/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import debounce from 'lodash/debounce'
import couponApi from '@/lib/services/couponApi'
import { CouponResponse } from '@/lib/types/Coupon'
import cartApi from '@/lib/services/cartApi'

interface OrderSummaryProps {
  refreshTrigger?: number
  isCheckoutPage?: boolean
  onCouponApplied?: (id: string, discount: number) => void
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  refreshTrigger,
  isCheckoutPage,
  onCouponApplied
}) => {
  const [total, setTotal] = useState(0)
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState<CouponResponse | null>(null)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCartTotal()
  }, [refreshTrigger])

  const fetchCartTotal = async () => {
    try {
      const response = await cartApi.getCurrentCart()
      if (response.data.isSuccess && response.data.data) {
        const cartTotal = response.data.data.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )
        setTotal(cartTotal)
      }
    } catch (error) {
      console.error('Error fetching cart total:', error)
    }
  }

  const debouncedValidateCoupon = useCallback(
    debounce(async (code: string) => {
      if (!code) return

      setIsValidatingCoupon(true)
      try {
        const response = await couponApi.getByCode(code)

        if (response.data.isSuccess) {
          const couponData = response.data.data!

          if (total < couponData.minimumOrderPrice) {
            toast.error(
              `Order total must be at least ${new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(couponData.minimumOrderPrice)}`
            )
            setCoupon(null)
            inputRef.current?.focus()
            return
          }

          setCoupon(couponData)
          toast.success('Coupon applied successfully!')
          if (onCouponApplied) {
            onCouponApplied(couponData.id, couponData.discount)
          }
        } else {
          toast.error(response.data.message || 'Invalid coupon code')
          setCoupon(null)
          inputRef.current?.focus()
        }
      } catch (error) {
        console.error('Error validating coupon:', error)
        toast.error('Error validating coupon')
        setCoupon(null)
        inputRef.current?.focus()
      } finally {
        setIsValidatingCoupon(false)
      }
    }, 2000),
    [total, onCouponApplied]
  )

  const handleCouponCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase()
    setCouponCode(code)
    if (code.length >= 3) {
      debouncedValidateCoupon(code)
    }
  }

  const getDiscountedAmount = () => {
    if (!coupon) return 0

    const calculatedDiscount = total * (coupon.discount / 100)
    const maxDiscount = coupon.maxDiscountAmount || Infinity

    // Return the calculated discount (for display)
    return calculatedDiscount
  }

  const getActualDiscountAmount = () => {
    if (!coupon) return 0

    const calculatedDiscount = total * (coupon.discount / 100)
    const maxDiscount = coupon.maxDiscountAmount || Infinity

    // Return the actual discount (capped at maximum)
    return Math.min(calculatedDiscount, maxDiscount)
  }

  const getFinalTotal = () => total - getActualDiscountAmount()

  useEffect(() => {
    return () => {
      debouncedValidateCoupon.cancel()
    }
  }, [debouncedValidateCoupon])

  const handleProceedToCheckout = () => {
    if (coupon) {
      navigate({
        to: '/checkout',
        search: {
          couponId: coupon.id,
          couponCode: couponCode,
          couponDiscount: coupon.discount,
          maxDiscountAmount: coupon.maxDiscountAmount,
          subtotal: total
        }
      })
    } else {
      navigate({ to: '/checkout' })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-white p-6 shadow"
    >
      <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Coupon Code</label>
          <input
            type="text"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={handleCouponCodeChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm uppercase focus:border-[#3A4D39] focus:outline-none"
            disabled={isValidatingCoupon}
          />
          {isValidatingCoupon && (
            <div className="text-sm text-gray-500">Validating...</div>
          )}
        </div>

        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span className="font-semibold">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(total)}
          </span>
        </div>

        {coupon && (
          <div className="flex justify-between text-sm text-red-500">
            <span>Discount ({coupon.discount}%):</span>
            <span className="font-semibold">
              -{' '}
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(getActualDiscountAmount())}
            </span>
          </div>
        )}

        {coupon && getDiscountedAmount() > (coupon.maxDiscountAmount || 0) && (
          <div className="text-xs text-gray-500">
            *Discount capped at maximum{' '}
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(coupon.maxDiscountAmount)}
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex justify-between">
            <span className="text-base font-semibold">Total:</span>
            <span className="text-base font-bold">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(getFinalTotal())}
            </span>
          </div>
        </div>

        <button
          onClick={handleProceedToCheckout}
          className="mt-4 w-full rounded-full bg-[#3A4D39] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4A5D49]"
        >
          Proceed to Checkout
        </button>
      </div>
    </motion.div>
  )
}

export default OrderSummary
