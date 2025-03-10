import React from 'react'
import { Input } from '@/components/ui/input'

interface CouponInputProps {
  couponCode: string
  onCouponCodeChange: (code: string) => void
}

const CouponInput: React.FC<CouponInputProps> = ({
  couponCode,
  onCouponCodeChange
}) => {
  return (
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder="Enter coupon code"
        value={couponCode}
        onChange={(e) => onCouponCodeChange(e.target.value)}
      />
    </div>
  )
}

export default CouponInput
