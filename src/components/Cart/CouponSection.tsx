import React, { useState, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Loader2, Tag } from 'lucide-react'
import { toast } from 'sonner'
import userApi from '@/lib/services/userService'
import couponApi from '@/lib/services/couponApi'
import { UserCouponResponse } from '@/lib/types/Coupon'

interface CouponSectionProps {
  subtotal: number
  onSelect: (couponData: {
    id: string
    discount: number
    maxDiscountAmount: number | null
  }) => void
}

const CouponSection: React.FC<CouponSectionProps> = ({
  subtotal,
  onSelect
}) => {
  const [userCoupons, setUserCoupons] = useState<UserCouponResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null)
  const [showCoupons, setShowCoupons] = useState(false)

  useEffect(() => {
    if (showCoupons) {
      fetchUserCoupons()
    }
  }, [showCoupons])

  const fetchUserCoupons = async () => {
    setIsLoading(true)
    try {
      const response = await userApi.getUserCoupons()
      const validCoupons = response.filter(
        (coupon) =>
          coupon.quantity > 0 && subtotal >= coupon.coupon.minimumOrderPrice
      )
      setUserCoupons(validCoupons)
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast.error('Failed to load coupons')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyCoupon = async (couponId: string) => {
    try {
      const selectedCoupon = userCoupons.find((c) => c.couponId === couponId)
      if (!selectedCoupon) return

      const response = await couponApi.getByCode(selectedCoupon.coupon.code)
      if (response.data.isSuccess && response.data.data) {
        setSelectedCouponId(couponId)
        onSelect({
          id: couponId,
          discount: selectedCoupon.coupon.discount,
          maxDiscountAmount: selectedCoupon.coupon.maxDiscountAmount
        })
        toast.success('Coupon applied successfully!')
      }
    } catch (error) {
      console.error('Error applying coupon:', error)
      toast.error('Failed to apply coupon')
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Available Coupons</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCoupons(!showCoupons)}
          className="text-xs text-[#3A4D39] hover:text-[#4A5D49]"
        >
          {showCoupons ? 'Hide Coupons' : 'Show Coupons'}
        </Button>
      </div>

      {showCoupons && (
        <div className="rounded-lg border p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="mr-2 size-4 animate-spin" />
              <span>Loading coupons...</span>
            </div>
          ) : userCoupons.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
              <Tag className="mx-auto mb-2 size-5" />
              <p>No applicable coupons available</p>
              <a
                href="/my_coupons"
                className="mt-1 inline-block text-xs text-[#3A4D39] hover:underline"
              >
                View all my coupons
              </a>
            </div>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {userCoupons.map((coupon) => (
                  <div
                    key={coupon.couponId}
                    className={`relative rounded-lg border p-3 transition-all hover:border-[#3A4D39] ${
                      selectedCouponId === coupon.couponId
                        ? 'border-[#3A4D39] bg-[#3A4D39]/5'
                        : ''
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold">{coupon.coupon.name}</h3>
                      <span className="text-sm text-gray-500">
                        x{coupon.quantity}
                      </span>
                    </div>

                    <div className="mb-2 text-lg font-bold text-[#3A4D39]">
                      {coupon.coupon.discount}% OFF
                    </div>

                    <div className="space-y-1 text-xs text-gray-500">
                      <p>
                        Min. order:{' '}
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(coupon.coupon.minimumOrderPrice)}
                      </p>
                      {coupon.coupon.maxDiscountAmount && (
                        <p>
                          Max discount:{' '}
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(coupon.coupon.maxDiscountAmount)}
                        </p>
                      )}
                    </div>

                    <Button
                      className="mt-2 w-full bg-[#3A4D39] text-white hover:bg-[#4A5D49]"
                      disabled={selectedCouponId === coupon.couponId}
                      onClick={() => handleApplyCoupon(coupon.couponId)}
                    >
                      {selectedCouponId === coupon.couponId
                        ? 'Applied'
                        : 'Apply Coupon'}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  )
}

export default CouponSection
