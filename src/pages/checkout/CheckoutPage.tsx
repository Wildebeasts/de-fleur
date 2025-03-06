/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import OrderSummary from '@/components/Cart/OrderSummary'
import SecurityInfo from '@/components/Cart/SecurityInfo'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import vnpayLogo from '@/assets/vnpay.jpg'
import paymentApi from '@/lib/services/paymentApi'
import orderApi from '@/lib/services/orderApi'
import { useNavigate } from '@tanstack/react-router'
import { CreateOrderRequest } from '@/lib/types/order'
import cartApi from '@/lib/services/cartApi'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

// Add payment method types
interface PaymentMethod {
  id: string
  name: string
  icon: string
  description: string
}

interface ShippingInfo {
  address: string
  wardCode: string
  districtId: number
}

interface ShippingForm {
  firstName: string
  lastName: string
  address: string
  wardCode: string
  districtId: number
  city: string
  postalCode: string
}

const CheckoutPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isCartLoading, setIsCartLoading] = useState(true)
  const [cartData, setCartData] = useState<any>(null)
  const navigate = useNavigate()

  // Form state
  const [formData, setFormData] = useState<ShippingForm>({
    firstName: '',
    lastName: '',
    address: '',
    wardCode: '21009', // Default value, should be selected by user
    districtId: 1566, // Default value, should be selected by user
    city: '',
    postalCode: ''
  })

  // Fetch cart data on component mount
  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      setIsCartLoading(true)
      const response = await cartApi.getCurrentCart()
      if (response.data.isSuccess && response.data.data) {
        setCartData(response.data.data)
      } else {
        toast.error('Giỏ hàng trống')
        navigate({ to: '/cart' })
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      toast.error('Không thể tải thông tin giỏ hàng')
      navigate({ to: '/cart' })
    } finally {
      setIsCartLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    const { firstName, lastName, address, city, postalCode } = formData
    if (!firstName || !lastName || !address || !city || !postalCode) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng')
      return false
    }
    return true
  }

  const handleCheckout = async () => {
    try {
      if (!validateForm()) return
      setIsLoading(true)

      if (!cartData || !cartData.id) {
        toast.error('Không tìm thấy giỏ hàng')
        navigate({ to: '/cart' })
        return
      }

      // Construct full address string
      const fullAddress = `${formData.firstName} ${formData.lastName}, ${formData.address}, ${formData.city}, ${formData.postalCode}`

      const orderRequest = {
        cartId: cartData.id,
        shippingAddress: fullAddress,
        billingAddress: fullAddress, // Using same address for billing
        paymentMethod: 'ONLINE',
        currency: 'VND',
        wardCode: formData.wardCode,
        districtId: formData.districtId
      }

      const response = await orderApi.createOrder(orderRequest)

      if (response.data.isSuccess && response.data.data?.paymentUrl) {
        // Redirect to payment page
        window.location.href = response.data.data.paymentUrl
      } else {
        toast.error('Không thể tạo đơn hàng')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Đặt hàng thất bại. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  // Update payment methods to only include VNPay
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'vnpay',
      name: 'VNPay',
      icon: vnpayLogo,
      description: 'Thanh toán nhanh chóng và an toàn với VNPay'
    }
  ]

  if (isCartLoading) {
    return (
      <div className="container mx-auto p-4">
        Loading checkout information...
      </div>
    )
  }

  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="mb-4 text-2xl font-semibold">Your cart is empty</h2>
        <Button onClick={() => navigate({ to: '/shop' })}>
          Continue Shopping
        </Button>
      </div>
    )
  }

  // Calculate cart total
  const cartTotal = cartData.items.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  )

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col overflow-hidden rounded-lg border-2 border-solid border-gray-300 bg-white"
    >
      <div className="flex w-full flex-col bg-orange-50 max-md:max-w-full">
        <motion.div
          variants={itemVariants}
          className="mx-auto max-w-screen-xl p-8"
        >
          <div className="flex gap-8 max-md:flex-col">
            <motion.div variants={itemVariants} className="w-2/3 max-md:w-full">
              <Card className="border-rose-200/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#3A4D39]">
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address</label>
                    <Input
                      name="address"
                      placeholder="Address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City</label>
                      <Input
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Postal Code</label>
                      <Input
                        name="postalCode"
                        placeholder="Postal Code"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6 border-rose-200/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#3A4D39]">
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.wardCode}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, wardCode: value }))
                    }
                    className="space-y-4"
                  >
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center space-x-4 rounded-lg border border-rose-200/50 p-4 hover:bg-rose-50/50"
                      >
                        <RadioGroupItem value={method.id} id={method.id} />
                        <Label
                          htmlFor={method.id}
                          className="flex flex-1 items-center space-x-3"
                        >
                          <img
                            src={method.icon}
                            alt={method.name}
                            className="size-8 object-contain"
                          />
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{method.name}</p>
                            <p className="text-xs text-gray-500">
                              {method.description}
                            </p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="w-1/3 max-md:w-full">
              <OrderSummary />
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6"
              >
                <Button
                  className="w-full rounded-full bg-[#3A4D39] py-6 text-white hover:bg-[#4A5D49]"
                  onClick={handleCheckout}
                  disabled={isLoading}
                >
                  {isLoading
                    ? 'Đang xử lý...'
                    : `Thanh toán ${cartTotal.toLocaleString('vi-VN')}₫`}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
        <SecurityInfo />
      </div>
    </motion.div>
  )
}

export default CheckoutPage
