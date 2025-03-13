import React from 'react'
import { CosmeticResponse } from '@/lib/types/Cosmetic'

type Props = {
  selectedProducts: (CosmeticResponse & { quantity: number })[]
}

const CustomerOrderSummary: React.FC<Props> = ({ selectedProducts }) => {
  const totalPrice = selectedProducts.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <div className="mt-4 flex flex-col rounded-lg bg-white p-4 shadow-md">
      {/* Order Summary Title */}
      <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

      {/* Scrollable List of Products */}
      <ul className="max-h-80 overflow-y-auto pr-2">
        {selectedProducts.map((product) => (
          <li key={product.id} className="flex justify-between border-b py-2">
            <span>
              {product.name} (x{product.quantity})
            </span>
            <span>
              {(product.price * product.quantity).toLocaleString()} VND
            </span>
          </li>
        ))}
      </ul>

      {/* Fixed Total Price at the Bottom */}
      <div className="mt-4 pt-4 text-lg font-bold">
        Total:{' '}
        <span className="text-green-600">
          {totalPrice.toLocaleString()} VND
        </span>
      </div>
    </div>
  )
}

export default CustomerOrderSummary
