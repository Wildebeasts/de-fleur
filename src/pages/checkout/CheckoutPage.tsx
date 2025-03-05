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
import { useCart } from '@/lib/context/CartContext' // Assuming you have a cart context

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

const CheckoutPage: React.FC = () => {
  const [selectedPayment, setSelectedPayment] = useState('vnpay')
  const [isLoading, setIsLoading] = useState(false)
  const { cartItems, getCartTotal } = useCart()
  const cartTotal = getCartTotal()

  // Format currency for VND
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const createOrder = async () => {
    // Mock GUID for testing only
    return '20556cf0-0556-4cb3-ad6f-90acbf6fc947'
  }

  const handlePayment = async () => {
    try {
      setIsLoading(true)
      const orderId = await createOrder()

      if (selectedPayment === 'vnpay') {
        const paymentData = {
          orderId,
          paymentMethod: 'VNPay',
          amount: cartTotal,
          currency: 'VND'
        }

        const response = await paymentApi.createPayment(paymentData)

        if (response.data.isSuccess && response.data.data) {
          window.location.href = response.data.data
        } else {
          toast.error('Failed to create payment link')
        }
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment processing failed. Please try again.')
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
                      <Input className="border-rose-200" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input className="border-rose-200" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address</label>
                    <Input className="border-rose-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City</label>
                      <Input className="border-rose-200" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Postal Code</label>
                      <Input className="border-rose-200" />
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
                    value={selectedPayment}
                    onValueChange={setSelectedPayment}
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
                  onClick={handlePayment}
                  disabled={isLoading}
                >
                  {isLoading
                    ? 'Đang xử lý...'
                    : `Thanh toán ${formatAmount(cartTotal)}`}
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
