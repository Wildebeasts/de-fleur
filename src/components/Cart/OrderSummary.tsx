import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from '@tanstack/react-router'
import { useCart } from '@/lib/context/CartContext'
import { useState } from 'react'
import { toast } from 'sonner'

const OrderSummary: React.FC = () => {
  const { getSubtotal, getCartTotal, coupon, applyCoupon, removeCoupon } =
    useCart()
  const [couponCode, setCouponCode] = useState('')

  const subtotal = getSubtotal()
  const total = getCartTotal()
  const discount = coupon ? subtotal - total : 0

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }

    // In a real application, you would validate the coupon with your API
    applyCoupon(couponCode)
    toast.success('Coupon applied successfully!')
    setCouponCode('')
  }

  return (
    <div className="flex w-full flex-col rounded-lg bg-white p-6 shadow-sm max-md:max-w-full max-md:px-5">
      <div className="flex w-full flex-col p-0.5 max-md:max-w-full">
        <div className="text-xl font-semibold leading-none text-black">
          Order Summary
        </div>

        <div className="mt-6 flex w-full flex-col rounded-lg bg-[#D1E2C4]/20 px-4 pb-6 pt-4">
          <div className="pb-4 text-xs font-semibold leading-none text-black">
            Apply Discount Code
          </div>
          <div className="flex gap-2.5">
            <Input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 rounded-lg border border-solid border-gray-300 px-4 py-2.5 text-sm text-black"
              placeholder="Enter code"
            />
            <Button
              onClick={handleApplyCoupon}
              className="rounded-lg bg-[#3A4D39] px-4 py-2.5 text-sm font-medium text-white"
            >
              Apply
            </Button>
          </div>

          {coupon && (
            <div className="mt-2 flex justify-between text-sm">
              <span>Applied: {coupon.code}</span>
              <button
                onClick={removeCoupon}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-solid border-gray-300 pt-6 text-black">
          <div className="flex justify-between gap-5 py-px">
            <div className="text-sm">Subtotal</div>
            <div className="text-right text-sm font-medium">
              ${subtotal.toFixed(2)}
            </div>
          </div>

          {discount > 0 && (
            <div className="flex justify-between gap-5 py-px text-green-600">
              <div className="text-sm">Discount</div>
              <div className="text-right text-sm font-medium">
                -${discount.toFixed(2)}
              </div>
            </div>
          )}

          <div className="flex justify-between gap-5 py-px">
            <div className="text-sm">Shipping</div>
            <div className="text-right text-sm font-medium">Free</div>
          </div>

          <div className="mt-2 flex justify-between gap-5 border-t border-solid border-gray-300 pt-4">
            <div className="text-base font-semibold">Total</div>
            <div className="text-right text-lg font-semibold">
              ${total.toFixed(2)}
            </div>
          </div>
        </div>

        <Link to="/checkout" className="mt-6">
          <Button className="w-full rounded-full bg-[#3A4D39] py-3 text-center text-base font-medium text-white">
            Proceed to Checkout
          </Button>
        </Link>

        <div className="mt-6 flex w-full flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-black">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/8a8c03b5ff6d7872e14f9d5dedd22c8fe52e56bd293e2b71b00fef03f84c1d83"
              alt="Secure payment"
              className="aspect-square w-5 object-contain"
            />
            <div>Secure Payment</div>
          </div>
          <div className="flex items-center gap-2 text-sm text-black">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/5a22c1452f1ec70602818a323e77c5d6ace2332e46f93d8ab8f9b6eaf4b3d3bc"
              alt="Free shipping"
              className="aspect-square w-5 object-contain"
            />
            <div>Free Shipping Over $75</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
