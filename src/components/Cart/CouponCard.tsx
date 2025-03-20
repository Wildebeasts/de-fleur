import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserCouponResponse } from '@/lib/types/Coupon'

interface CouponCardProps {
  coupon: UserCouponResponse
  isSelected: boolean
  onSelect: (code: string) => void
}

const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  isSelected,
  onSelect
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Card
      className={`relative overflow-hidden transition-all ${isSelected ? 'border-2 border-[#3A4D39]' : 'border border-gray-200'}`}
    >
      <div className="absolute right-0 top-0">
        {isSelected && (
          <Badge className="rounded-bl-md rounded-tr-md bg-[#3A4D39]">
            Selected
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{coupon.coupon.name}</h3>
          <span className="text-sm text-gray-500">x{coupon.quantity}</span>
        </div>

        <div className="mb-3 text-xl font-bold text-[#3A4D39]">
          {coupon.coupon.discount}% OFF
        </div>

        <div className="mb-3 space-y-1 text-sm text-gray-600">
          <div>
            Min. order: {formatCurrency(coupon.coupon.minimumOrderPrice)}
          </div>
          {coupon.coupon.maxDiscountAmount && (
            <div>
              Max discount: {formatCurrency(coupon.coupon.maxDiscountAmount)}
            </div>
          )}
          <div>
            Valid until:{' '}
            {new Date(coupon.coupon.expiryDate).toLocaleDateString()}
          </div>
        </div>

        <Button
          onClick={() => onSelect(coupon.coupon.code)}
          className={`w-full ${isSelected ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-[#3A4D39] text-white hover:bg-[#4A5D49]'}`}
          disabled={isSelected}
        >
          {isSelected ? 'Applied' : 'Apply Coupon'}
        </Button>
      </CardContent>
    </Card>
  )
}

export default CouponCard
