/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SecurityInfo from '@/components/Cart/SecurityInfo'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import vnpayLogo from '@/assets/vnpay.jpg'

import orderApi from '@/lib/services/orderApi'
import { useNavigate } from '@tanstack/react-router'
import cartApi from '@/lib/services/cartApi'
import { useDelivery } from '@/lib/context/DeliveryContext'
import ComboBox from '@/components/ui/combobox'
import { CalculateShippingFeeRequest } from '@/lib/types/delivery'
import { CartItem } from '@/lib/types/Cart'

import couponApi from '@/lib/services/couponApi'
import axios, { AxiosError } from 'axios'
import CheckoutSummary from '@/components/Cart/CheckoutSummary'

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
  houseNumberStreet: string
  wardCode: string
  districtId: number
  provinceId: number
}

interface ShippingForm {
  houseNumberStreet: string
  shippingAddress: string
  billingAddress: string
  wardCode: string
  districtId: number
  paymentMethod: string
  couponId: string | null
  currency: string
  provinceId: number
}

const CheckoutPage: React.FC = () => {
  // Add these state variables with your other useState declarations
  const [originalSubtotal, setOriginalSubtotal] = useState<number>(0)
  const [finalSubtotal, setFinalSubtotal] = useState<number>(0)
  const [discountAmount, setDiscountAmount] = useState<number>(0)

  // Your existing state variables
  const [isLoading, setIsLoading] = useState(false)
  const [isCartLoading, setIsCartLoading] = useState(true)
  const [cartData, setCartData] = useState<any>(null)
  const {
    provinces,
    districts,
    wards,
    fetchDistricts,
    fetchWards,
    isDistrictsLoading,
    isProvincesLoading,
    isWardsLoading,
    calculateShippingFee,
    resetShippingFee
  } = useDelivery()
  const navigate = useNavigate()
  const [couponId, setCouponId] = useState<string | null>(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | null>(
    null
  )
  const [subtotal, setSubtotal] = useState(0)
  const [minimumOrderPrice, setMinimumOrderPrice] = useState<number | null>(
    null
  )

  // Form state
  const [formData, setFormData] = useState<ShippingForm>({
    houseNumberStreet: '',
    shippingAddress: '',
    billingAddress: '',
    wardCode: '',
    districtId: 0,
    paymentMethod: 'ONLINE',
    couponId: '6e8f40e3-7a19-4a41-b3f8-4dff00fd8c21', // Your coupon ID
    currency: 'VND',
    provinceId: 0
  })

  // Get search params from URL
  const searchParams = new URLSearchParams(window.location.search)
  const urlCouponId = searchParams.get('couponId')
  const urlCouponCode = searchParams.get('couponCode')
  const urlCouponDiscount = searchParams.get('couponDiscount')
    ? parseFloat(searchParams.get('couponDiscount')!)
    : 0
  const urlMaxDiscountAmount = searchParams.get('maxDiscountAmount')
    ? parseFloat(searchParams.get('maxDiscountAmount')!)
    : 0
  const urlSubtotal = searchParams.get('subtotal')
    ? parseFloat(searchParams.get('subtotal')!)
    : 0

  // Initialize state with URL parameters
  useEffect(() => {
    if (urlCouponId && urlCouponCode) {
      // Pre-fill the coupon code in the OrderSummary component
      const orderSummaryInput = document.querySelector(
        'input[placeholder="Enter coupon code"]'
      ) as HTMLInputElement
      if (orderSummaryInput) {
        orderSummaryInput.value = urlCouponCode

        // Trigger validation to apply the coupon
        setTimeout(() => {
          const event = new Event('input', { bubbles: true })
          orderSummaryInput.dispatchEvent(event)
        }, 500)
      }
    }
  }, [urlCouponId, urlCouponCode])

  // Fetch cart data on component mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setIsCartLoading(true)
        const response = await cartApi.getCurrentCart()
        if (response.data.isSuccess && response.data.data) {
          setCartData(response.data.data)
        } else {
          toast.error('Empty cart')
          navigate({ to: '/cart' })
        }
      } catch (error) {
        console.error('Error fetching cart:', error)
        toast.error('Cannot load cart information')
        navigate({ to: '/cart' })
      } finally {
        setIsCartLoading(false)
      }
    }

    fetchCart()
  }, [])

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    // Reset district and ward when province changes
    setFormData((prev) => ({
      ...prev,
      districtId: 0, // Reset district
      wardCode: '' // Reset ward
    }))
    resetShippingFee() // Reset the shipping fee
    if (formData.provinceId !== 0) {
      fetchDistricts(formData.provinceId)
    }
  }, [formData.provinceId])

  useEffect(() => {
    // Reset ward when district changes
    setFormData((prev) => ({
      ...prev,
      wardCode: '' // Reset ward
    }))
    resetShippingFee() // Reset the shipping fee
    if (formData.districtId !== 0) {
      fetchWards(formData.districtId)
    }
  }, [formData.districtId])

  useEffect(() => {
    if (
      formData.provinceId &&
      formData.districtId &&
      formData.wardCode &&
      cartData?.items.length
    ) {
      calculateShippingFee(buildShippingRequest())
    }
  }, [formData.districtId, formData.wardCode, cartData])

  const buildShippingRequest = (): CalculateShippingFeeRequest => {
    const items =
      cartData?.items.map((item: CartItem) => ({
        code: item.cosmeticId,
        name: item.cosmeticName,
        quantity: item.quantity,
        price: item.price,
        weight: item.weight,
        length: item.length,
        width: item.width,
        height: item.height
      })) || []

    const totalWeight = items.reduce(
      (sum: number, item: CartItem) => sum + item.weight * item.quantity,
      0
    )
    const maxLength = Math.max(...items.map((item: CartItem) => item.length))
    const maxWidth = Math.max(...items.map((item: CartItem) => item.width))
    const totalHeight = items.reduce(
      (sum: number, item: CartItem) => sum + item.height * item.quantity,
      0
    )

    // Calculate total price with percentage discount
    const cartTotal = Math.round(cartData?.totalPrice || 0)
    const discountMultiplier = 1 - (couponDiscount || 0) / 100 // Convert percentage to multiplier
    const finalTotal = Math.round(cartTotal * discountMultiplier)

    console.log('Cart Total:', cartTotal)
    console.log('Discount Multiplier:', discountMultiplier)
    console.log('Final Total:', finalTotal)

    return {
      from_district_id: 3695,
      from_ward_code: '90764',
      service_id: 0,
      service_type_id: 2,
      to_district_id: formData.districtId,
      to_ward_code: formData.wardCode,
      weight: totalWeight,
      length: maxLength,
      width: maxWidth,
      height: totalHeight,
      insurance_value: cartTotal - discountAmount,
      cod_failed_amount: 0,
      coupon: null,
      items
    }
  }

  const handleCouponApplied = (
    id: string,
    discount: number,
    maxAmount?: number,
    minOrderPrice?: number
  ) => {
    setCouponId(id)
    setCouponDiscount(discount)
    if (maxAmount) {
      setMaxDiscountAmount(maxAmount)
    }
    if (minOrderPrice) {
      setMinimumOrderPrice(minOrderPrice)
    }

    // Update form data with coupon ID
    setFormData((prev) => ({
      ...prev,
      couponId: id
    }))
  }

  const calculateActualDiscount = () => {
    const calculatedDiscount = cartData?.totalPrice * (couponDiscount / 100)

    if (maxDiscountAmount && calculatedDiscount > maxDiscountAmount) {
      return maxDiscountAmount
    }

    return calculatedDiscount
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Get couponId from URL parameters
    const searchParams = new URLSearchParams(window.location.search)
    const couponId =
      searchParams.get('couponId')?.replace(/"/g, '') || undefined

    // Log the couponId to verify
    console.log('CouponId from URL:', couponId)

    try {
      // Get the selected location names
      const selectedProvince = provinces.find(
        (p) => p.ProvinceID.toString() === formData.provinceId.toString()
      )?.ProvinceName
      const selectedDistrict = districts.find(
        (d) => d.DistrictID.toString() === formData.districtId.toString()
      )?.DistrictName
      const selectedWard = wards.find(
        (w) => w.WardCode === formData.wardCode
      )?.WardName

      // Construct the full address
      const fullAddress = `${formData.houseNumberStreet}, ${selectedWard}, ${selectedDistrict}, ${selectedProvince}`

      const orderRequest = {
        ...formData,
        shippingAddress: fullAddress,
        billingAddress: fullAddress,
        couponId // Include couponId from URL
      }

      // Log the complete order request
      console.log('Order request data:', orderRequest)

      const response = await orderApi.createOrder(orderRequest)

      if (response.data.isSuccess) {
        // Clear the coupon from localStorage when order is created
        localStorage.removeItem('cartCoupon')

        if (formData.paymentMethod === 'ONLINE') {
          // Redirect to payment URL
          window.location.href = response.data.data?.paymentUrl || ''
        } else if (formData.paymentMethod === 'COD') {
          // For COD, simply show a confirmation and navigate
          toast.success(
            'Order created. You will pay when you receive the order.'
          )
          navigate({ to: '/order_history' })
        }
      } else {
        toast.error(response.data.message || 'Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || 'Something went wrong!'
        toast.error(`${errorMessage}`)
      } else {
        toast.error('An unexpected error occurred!')
      }
    }
  }

  // Update payment methods to only include VNPay
  // Update payment methods to include both VNPay and COD
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'ONLINE',
      name: 'ONLINE',
      icon: vnpayLogo,
      description: 'Quick and secure payment with VNPay'
    },
    {
      id: 'COD',
      name: 'COD',
      icon: '', // Add a cash icon if available or leave it blank
      description: 'Pay when you receive the order'
    }
  ]

  // Add this function to calculate the final total after discount
  const getFinalTotal = () => {
    const discountAmount = calculateActualDiscount()
    return cartData?.totalPrice - discountAmount
  }

  // In the useEffect or at the beginning of the component
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)

    // Parse values from URL, removing quotes and converting to numbers
    const originalSubtotal =
      Number(searchParams.get('originalSubtotal')?.replace(/"/g, '')) || 0
    const finalSubtotal =
      Number(searchParams.get('subtotal')?.replace(/"/g, '')) || 0
    const discountAmount =
      Number(searchParams.get('discountAmount')?.replace(/"/g, '')) || 0
    const couponId =
      searchParams.get('couponId')?.replace(/"/g, '') || undefined

    console.log('URL Parameters:')
    console.log('Original Subtotal:', originalSubtotal)
    console.log('Final Subtotal:', finalSubtotal)
    console.log('Discount Amount:', discountAmount)
    console.log('Coupon ID:', couponId)

    // Set state variables
    setOriginalSubtotal(originalSubtotal)
    setFinalSubtotal(finalSubtotal)
    setDiscountAmount(discountAmount)

    // If there's a coupon ID, fetch the coupon details
    if (couponId) {
      setCouponId(couponId)
      setFormData((prev) => ({
        ...prev,
        couponId
      }))

      // Optionally fetch coupon details to get discount percentage, min order, etc.
      const fetchCouponDetails = async () => {
        try {
          const response = await couponApi.getById(couponId)
          if (response.data.isSuccess && response.data.data) {
            const couponData = response.data.data
            setCouponDiscount(couponData.discount)
            setMaxDiscountAmount(couponData.maxDiscountAmount)
            setMinimumOrderPrice(couponData.minimumOrderPrice)
          }
        } catch (error) {
          console.error('Error fetching coupon details:', error)
        }
      }

      fetchCouponDetails()
    }
  }, [])

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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address</label>
                    <Input
                      className="font-medium"
                      placeholder="Số nhà & đường"
                      value={formData.houseNumberStreet}
                      onChange={(e) =>
                        handleChange('houseNumberStreet', e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Province</label>
                    <ComboBox
                      items={provinces.map((p) => ({
                        value: p.ProvinceID.toString(),
                        label: p.ProvinceName
                      }))}
                      placeholder="Select province"
                      value={formData.provinceId}
                      onValueChange={(e) => {
                        handleChange('provinceId', e.toString())
                      }}
                      disabled={isProvincesLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">District</label>
                    <ComboBox
                      items={districts.map((d) => ({
                        value: d.DistrictID.toString(),
                        label: d.DistrictName
                      }))}
                      placeholder="Select district"
                      value={formData.districtId!}
                      onValueChange={(e) => {
                        handleChange('districtId', e.toString())
                      }}
                      disabled={isDistrictsLoading || formData.provinceId === 0}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ward</label>
                    <ComboBox
                      items={wards.map((w) => ({
                        value: w.WardCode,
                        label: w.WardName
                      }))}
                      placeholder="Select ward"
                      value={formData.wardCode || ''}
                      onValueChange={(e) =>
                        handleChange('wardCode', e.toString())
                      }
                      disabled={isWardsLoading || formData.districtId === 0}
                    />
                  </div>

                  <Button
                    disabled={isLoading}
                    onClick={handleSubmit}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? 'Processing...' : 'Pay'}
                  </Button>
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
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, paymentMethod: value }))
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
                          {method.icon && (
                            <img
                              src={method.icon}
                              alt={method.name}
                              className="size-8 object-contain"
                            />
                          )}
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
              <CheckoutSummary
                originalSubtotal={originalSubtotal}
                finalSubtotal={finalSubtotal}
                discountAmount={discountAmount}
                minimumOrderPrice={minimumOrderPrice}
                couponDiscount={couponDiscount}
                maxDiscountAmount={maxDiscountAmount}
              />
            </motion.div>
          </div>
        </motion.div>
        <SecurityInfo />
      </div>
    </motion.div>
  )
}

export default CheckoutPage
