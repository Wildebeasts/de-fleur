import React from 'react'
import { motion } from 'framer-motion'
import { useDelivery } from '@/lib/context/DeliveryContext'

interface CheckoutSummaryProps {
  originalSubtotal: number // Original price before any discounts
  discountAmount: number // Amount being discounted
  finalSubtotal: number // Price after discount (originalSubtotal - discountAmount)
  minimumOrderPrice?: number | null
  couponDiscount?: number
  maxDiscountAmount?: number | null
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  originalSubtotal,
  discountAmount,
  finalSubtotal
}) => {
  // Get shipping fee from delivery context
  const { shippingFee } = useDelivery()

  // Calculate total with shipping
  const shippingCost = shippingFee?.total || 0
  const finalTotal = finalSubtotal + shippingCost

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-white p-6 shadow"
    >
      <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span className="font-semibold">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(originalSubtotal)}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-red-500">
            <span>Discount:</span>
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

        <div className="flex justify-between text-sm">
          <span>Shipping Fee:</span>
          <span className="font-semibold">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(shippingCost)}
          </span>
        </div>

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
    </motion.div>
  )
}

export default CheckoutSummary
