import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CosmeticResponse } from '@/lib/types/Cosmetic'
import { Cosmetics, OrderWalkInRequest } from '@/lib/types/order'
import { Minus, Plus, Trash2 } from 'lucide-react'
import userApi, { UserDto } from '@/lib/services/userService'
import { toast } from 'sonner'
import ComboBox from '../ui/combobox'

interface OrderSummaryProps {
  selectedProducts: CosmeticResponse[]
  onIncreaseQuantity: (product: CosmeticResponse) => void
  onDecreaseQuantity: (productId: string) => void
  onRemoveProduct: (productId: string) => void
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  selectedProducts,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveProduct
}) => {
  const [users, setUsers] = useState<UserDto[]>([])
  const [loading, setLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState<OrderWalkInRequest>({
    Cosmetics: {},
    CustomerId: null, // or pass actual customer ID if available
    CustomerPhoneNumber: '0', // Replace with actual input value
    CouponId: null, // or actual coupon ID if applied
    PaymentMethod: 'CASH' // or 'Credit Card' based on selection
  })

  const handleSubmitOrder = () => {
    const cosmeticsPayload: Cosmetics = selectedProducts.reduce(
      (acc, product) => {
        acc[product.id] = product.quantity
        return acc
      },
      {} as Cosmetics
    )

    const orderRequest: OrderWalkInRequest = {
      Cosmetics: cosmeticsPayload,
      CustomerId: formData.CustomerId, // or pass actual customer ID if available
      CustomerPhoneNumber: formData.CustomerPhoneNumber, // Replace with actual input value
      CouponId: formData.CouponId, // or actual coupon ID if applied
      PaymentMethod: formData.PaymentMethod // or 'Credit Card' based on selection
    }

    console.log(orderRequest) // For debugging before sending
    // Call API to place order
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const response = await userApi.getUsers(1, 10)
        console.log(response)

        if (response.isSuccess) {
          setUsers(response.data)
        } else {
          toast.error('no users available')
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        toast.error('Error fetching users')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const total = selectedProducts.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-20 rounded-2xl bg-white p-6 shadow-md"
    >
      <h2 className="mb-4 text-xl font-bold text-[#3A4D39]">Order Summary</h2>

      {selectedProducts.length === 0 ? (
        <p className="text-center text-gray-500">No items added to order</p>
      ) : (
        <ul className="mb-4 space-y-3">
          {selectedProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between border-b pb-2"
            >
              <div className="flex items-center gap-3">
                <img
                  src={product.thumbnailUrl!}
                  alt={product.name}
                  className="size-12 rounded-lg object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-[#3A4D39]">
                    {product.name} ({product.quantity})
                  </p>
                  <p className="text-xs text-gray-500">
                    {product.price.toLocaleString()} VND
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDecreaseQuantity(product.id)}
                  className="rounded-lg bg-gray-200 p-2 hover:bg-gray-300"
                >
                  <Minus size={16} />
                </motion.button>
                <span className="w-6 text-center">{product.quantity}</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onIncreaseQuantity(product)}
                  className="rounded-lg bg-gray-200 p-2 hover:bg-gray-300"
                >
                  <Plus size={16} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onRemoveProduct(product.id)}
                  className="rounded-lg bg-red-100 p-2 text-red-500 hover:bg-red-200"
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </ul>
      )}

      {selectedProducts.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Customers</label>
            <ComboBox
              items={users.map((d) => ({
                value: d.phoneNumber,
                label: d.userName + '-' + d.phoneNumber
              }))}
              placeholder="Select a customer"
              value={formData.CustomerPhoneNumber}
              onValueChange={(e) => {
                handleChange('CustomerPhoneNumber', e.toString())
              }}
              disabled={loading}
              filterBy="value"
            />
          </div>

          <div className="flex justify-between text-sm font-semibold">
            <span>Total:</span>
            <span className="font-bold text-[#3A4D39]">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(total)}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 w-full rounded-full bg-[#c183de] px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-colors duration-300 hover:bg-[#482daa] disabled:opacity-50"
            onClick={handleSubmitOrder}
          >
            {'Create Order'}
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}

export default OrderSummary
