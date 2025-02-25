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

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: '/assets/logos/credit-card.svg',
    description: 'Pay securely with your card'
  },
  {
    id: 'vnpay',
    name: 'VNPay',
    icon: vnpayLogo,
    description: 'Fast and secure payment with VNPay'
  },
  {
    id: 'braintree',
    name: 'Braintree',
    icon: '/assets/logos/braintree-logo.svg',
    description: 'Powered by PayPal'
  }
]

const CheckoutPage: React.FC = () => {
  const [selectedPayment, setSelectedPayment] = useState('card')
  const [isLoading, setIsLoading] = useState(false)
  const [exchangeRate, setExchangeRate] = useState(23500) // Default fallback rate (1 USD ≈ 23,500 VND)
  const { cartItems, getCartTotal } = useCart()
  const cartTotal = getCartTotal() // USD total

  // Fetch exchange rate on component mount
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        // Using ExchangeRate-API - replace with your preferred API
        const response = await fetch('https://open.er-api.com/v6/latest/USD')
        const data = await response.json()
        if (data.rates && data.rates.VND) {
          setExchangeRate(data.rates.VND)
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error)
        // Keep the fallback rate
      }
    }

    fetchExchangeRate()
  }, [])

  const createOrder = async () => {
    // This would typically call your API to create an order
    // For now, we'll just mock a GUID string as the order ID
    // In production, replace this with your actual order creation API call

    // Mock GUID for testing only
    return '12345678-1234-1234-1234-123456789012'
  }

  const handlePayment = async () => {
    try {
      setIsLoading(true)

      // Create an order and get the order ID
      const orderId = await createOrder()

      if (selectedPayment === 'vnpay') {
        // Convert USD to VND for VNPay
        const amountInVND = Math.round(cartTotal * exchangeRate)

        // Create VNPay payment
        const paymentData = {
          orderId,
          paymentMethod: 'VNPay',
          amount: amountInVND // Now in VND
        }

        const response = await paymentApi.createPayment(paymentData)

        if (response.data.isSuccess && response.data.data) {
          // Redirect to the VNPay payment URL
          window.location.href = response.data.data
        } else {
          toast.error('Failed to create payment link')
        }
      } else if (selectedPayment === 'card') {
        // Handle credit card payment in USD
        toast.success('Processing credit card payment...')
        // Implement card payment logic
      } else if (selectedPayment === 'braintree') {
        // Handle Braintree payment in USD
        toast.success('Processing Braintree payment...')
        // Implement Braintree payment logic
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment processing failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

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

                  {/* Conditional render based on selected payment method */}
                  {selectedPayment === 'card' && (
                    <div className="mt-6 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Card Number
                        </label>
                        <Input
                          className="border-rose-200"
                          placeholder="**** **** **** ****"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Expiry Date
                          </label>
                          <Input
                            className="border-rose-200"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">CVV</label>
                          <Input
                            className="border-rose-200"
                            placeholder="***"
                          />
                        </div>
                      </div>
                    </div>
                  )}
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
                  {isLoading ? 'Processing...' : 'Complete Order'}
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
