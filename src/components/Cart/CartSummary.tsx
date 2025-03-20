import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'
import CouponSection from './CouponSection'
import { Button } from '@/components/ui/button'
import { CartResponse } from '@/lib/types/Cart'

interface CartSummaryProps {
  cart: CartResponse
  onCouponApplied: (couponData: {
    id: string
    discount: number
    maxDiscountAmount: number | null
  }) => void
}

const CartSummary: React.FC<CartSummaryProps> = ({ cart, onCouponApplied }) => {
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string
    discount: number
    maxDiscountAmount: number | null
  } | null>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const navigate = useNavigate()

  // Calculate subtotal from cart
  const subtotal = cart.totalPrice

  // Calculate coupon discount when coupon or subtotal changes
  useEffect(() => {
    if (appliedCoupon && subtotal > 0) {
      const calculatedDiscount = subtotal * (appliedCoupon.discount / 100)
      const finalDiscount = appliedCoupon.maxDiscountAmount
        ? Math.min(calculatedDiscount, appliedCoupon.maxDiscountAmount)
        : calculatedDiscount

      setDiscountAmount(finalDiscount)
    } else {
      setDiscountAmount(0)
    }
  }, [appliedCoupon, subtotal])

  const handleCouponSelect = (couponData: {
    id: string
    discount: number
    maxDiscountAmount: number | null
  }) => {
    setAppliedCoupon(couponData)
    onCouponApplied(couponData)
  }

  const finalTotal = subtotal - discountAmount

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-white p-6 shadow"
    >
      <h2 className="mb-4 text-lg font-semibold">Cart Summary</h2>

      <div className="space-y-4">
        <CouponSection onSelect={handleCouponSelect} subtotal={subtotal} />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-semibold">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(subtotal)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-red-500">
              <span>Coupon Discount:</span>
              <span className="font-semibold">
                -{' '}
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(discountAmount)}
              </span>
            </div>
          )}

          <div className="border-t pt-2">
            <div className="flex justify-between">
              <span className="text-base font-semibold">Total:</span>
              <span className="text-base font-bold">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(finalTotal)}
              </span>
            </div>
          </div>
        </div>

        <Button
          className="mt-4 w-full rounded-full bg-[#3A4D39] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4A5D49]"
          onClick={() => {
            navigate({
              to: '/checkout',
              search: {
                subtotal: finalTotal.toString(),
                originalSubtotal: subtotal.toString(),
                discountAmount: discountAmount.toString(),
                couponId: appliedCoupon?.id || ''
              }
            })
          }}
        >
          Proceed to Checkout
        </Button>
      </div>
    </motion.div>
  )
}

export default CartSummary
