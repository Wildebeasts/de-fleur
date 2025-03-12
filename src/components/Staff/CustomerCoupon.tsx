import { CouponResponse } from '@/lib/types/Coupon'
import React from 'react'

type Props = {
  coupon: CouponResponse | null
}

const CustomerCoupon: React.FC<Props> = ({ coupon }) => {
  return (
    <div className="mt-4 rounded-lg bg-white p-4 shadow-md">
      <h2 className="mb-2 text-xl font-semibold">Coupon</h2>
      {coupon ? (
        <div>
          <p className="text-green-600">
            Applied: <strong>{coupon.code}</strong>
          </p>
          <p className="text-red-500">Discount: - {coupon.discount} %</p>
        </div>
      ) : (
        <p className="text-gray-500">No coupon applied</p>
      )}
    </div>
  )
}

export default CustomerCoupon
