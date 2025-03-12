import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CosmeticResponse } from '@/lib/types/Cosmetic'
import { Cosmetics, OrderWalkInRequest } from '@/lib/types/order'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import couponApi from '@/lib/services/couponApi'
import orderApi from '@/lib/services/orderApi'
import { CouponResponse } from '@/lib/types/Coupon'

interface OrderSummaryProps {
  selectedProducts: CosmeticResponse[]
  onIncreaseQuantity: (product: CosmeticResponse) => void
  onDecreaseQuantity: (productId: string) => void
  onRemoveProduct: (productId: string) => void
  coupon: CouponResponse | null
  setCoupon: (coupon: CouponResponse | null) => void
  setCustomerName: (customerName: string) => void
  setCustomerPhoneNumber: (customerPhoneNumber: string) => void
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  selectedProducts,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveProduct,
  coupon,
  setCoupon,
  setCustomerName,
  setCustomerPhoneNumber
}) => {
  const [couponCode, setCouponCode] = useState('') // State for coupon code input
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false) // Loading state for coupon validation
  // Form state
  const [formData, setFormData] = useState<OrderWalkInRequest>({
    Cosmetics: {},
    FirstName: '',
    LastName: '',
    CustomerPhoneNumber: '', // Replace with actual input value
    CouponId: null, // or actual coupon ID if applied
    PaymentMethod: 'CASH' // or 'Credit Card' based on selection
  })

  useEffect(() => {
    const fullName = `${formData.FirstName} ${formData.LastName}`.trim()
    setCustomerName(fullName)
  }, [formData.FirstName, formData.LastName, setCustomerName])

  useEffect(() => {
    setCustomerPhoneNumber(formData.CustomerPhoneNumber)
  }, [formData.CustomerPhoneNumber, setCustomerPhoneNumber])

  const handleSubmitOrder = async () => {
    // Validate form data
    const validationErrors: { [key: string]: string } = {}

    // Validate CustomerPhoneNumber
    if (!formData.CustomerPhoneNumber) {
      validationErrors.CustomerPhoneNumber = 'Phone number is required'
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.CustomerPhoneNumber)) {
      validationErrors.CustomerPhoneNumber = 'Invalid phone number'
    }

    // Validate FirstName
    if (!formData.FirstName) {
      validationErrors.FirstName = 'First name is required'
    } else if (formData.FirstName.length > 50) {
      validationErrors.FirstName = 'First name cannot exceed 50 characters'
    }

    // Validate LastName
    if (!formData.LastName) {
      validationErrors.LastName = 'Last name is required'
    } else if (formData.LastName.length > 50) {
      validationErrors.LastName = 'Last name cannot exceed 50 characters'
    }

    // If there are validation errors, display them and stop submission
    if (Object.keys(validationErrors).length > 0) {
      Object.entries(validationErrors).forEach(([field, message]) => {
        toast.error(`${field}: ${message}`)
      })
      return
    }

    const cosmeticsPayload: Cosmetics = selectedProducts.reduce(
      (acc, product) => {
        acc[product.id] = product.quantity
        return acc
      },
      {} as Cosmetics
    )

    const orderRequest: OrderWalkInRequest = {
      Cosmetics: cosmeticsPayload,
      FirstName: formData.FirstName,
      LastName: formData.LastName,
      CustomerPhoneNumber: formData.CustomerPhoneNumber, // Replace with actual input value
      CouponId: formData.CouponId, // or actual coupon ID if applied
      PaymentMethod: formData.PaymentMethod // or 'Credit Card' based on selection
    }

    console.log(orderRequest) // For debugging before sending

    try {
      // Call the API to create a walk-in order
      const response = await orderApi.createWalkInOrder(orderRequest)

      if (response.data.isSuccess) {
        // Handle successful order creation
        toast.success('Order created successfully!')
        console.log('Order created:', response.data.data)
      } else {
        // Handle API error
        toast.error(response.data.message || 'Failed to create order')
      }
    } catch (error) {
      // Handle network or server errors
      console.error('Error creating order:', error)
      toast.error('An error occurred while creating the order')
    }
  }

  const validateCoupon = async () => {
    if (!couponCode) {
      toast.error('Please enter a coupon code')
      return
    }

    setIsValidatingCoupon(true)

    try {
      // Call your API to validate the coupon code
      const response = await couponApi.getCouponByCode(couponCode)

      if (response.data.isSuccess) {
        // If the coupon is valid, set the CouponId in formData
        if (
          response.data.data!.usageLimit == 0 ||
          new Date(response.data.data!.expiryDate) < new Date()
        ) {
          toast.error('Coupon is not available')
          setFormData((prev) => ({
            ...prev,
            CouponId: null
          }))
        } else {
          setFormData((prev) => ({
            ...prev,
            CouponId: response.data.data!.id
          }))
          setCoupon(response.data.data!)
          toast.success('Coupon applied successfully!')
        }
      } else {
        // If the coupon is invalid, display an error message
        setCoupon(null)
        toast.error(response.data.message || 'Invalid coupon code')
        setFormData((prev) => ({
          ...prev,
          CouponId: null
        }))
      }
    } catch (error) {
      console.error('Error validating coupon:', error)
      toast.error('Failed to validate coupon')
      setFormData((prev) => ({
        ...prev,
        CouponId: null
      }))
    } finally {
      setIsValidatingCoupon(false)
    }
  }

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
        <div className="mt-4">
          {/* Customer Phone Number Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={formData.CustomerPhoneNumber}
              onChange={(e) =>
                handleChange('CustomerPhoneNumber', e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#c183de] focus:outline-none"
            />
          </div>

          {/* First Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">First Name</label>
            <input
              type="text"
              placeholder="Enter first name"
              value={formData.FirstName}
              onChange={(e) => handleChange('FirstName', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#c183de] focus:outline-none"
            />
          </div>

          {/* Last Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Last Name</label>
            <input
              type="text"
              placeholder="Enter last name"
              value={formData.LastName}
              onChange={(e) => handleChange('LastName', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#c183de] focus:outline-none"
            />
          </div>

          {/* Coupon Code Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Coupon Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#c183de] focus:outline-none"
              />
              <button
                type="button"
                onClick={validateCoupon}
                disabled={isValidatingCoupon}
                className="rounded-lg bg-[#c183de] px-4 py-2 text-sm font-medium text-white hover:bg-[#482daa] disabled:opacity-50"
              >
                {isValidatingCoupon ? 'Validating...' : 'Apply'}
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-4 text-sm font-semibold text-gray-500">
            <span>Sub Total:</span>
            <span className="font-bold text-gray-500">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(total)}
            </span>
          </div>

          <div className="flex justify-between pt-2 text-sm font-semibold text-red-500">
            <span>Discount:</span>
            <span className="font-bold text-red-500">
              -{' '}
              {coupon
                ? new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(total * (coupon!.discount / 100))
                : '0 ₫'}
            </span>
          </div>

          <div className="mt-4 flex justify-between border-t pt-2 text-sm font-semibold text-black">
            <span>Total:</span>
            <span className="font-bold text-black">
              {coupon
                ? new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(total - total * (coupon!.discount / 100))
                : new Intl.NumberFormat('vi-VN', {
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
