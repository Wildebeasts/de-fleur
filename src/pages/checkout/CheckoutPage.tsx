/* eslint-disable react-hooks/exhaustive-deps */
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
import { useDelivery } from '@/lib/context/DeliveryContext'
import ComboBox from '@/components/ui/combobox'
import { CalculateShippingFeeRequest } from '@/lib/types/delivery'
import { CartItem } from '@/lib/types/Cart'
import { CouponResponse } from '@/lib/types/Coupon'
import couponApi from '@/lib/services/couponApi'
import axios, { AxiosError } from 'axios'

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

  // Fetch cart data on component mount
  useEffect(() => {
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
    const maxHeight = Math.max(...items.map((item: CartItem) => item.height))

    return {
      from_district_id: 3695, // Your shop's district ID
      from_ward_code: '90764', // Your shop's ward code
      service_id: 0,
      service_type_id: 2,
      to_district_id: formData.districtId,
      to_ward_code: formData.wardCode,
      weight: totalWeight,
      length: maxLength,
      width: maxWidth,
      height: maxHeight,
      insurance_value: cartData?.totalPrice || 1000000,
      cod_failed_amount: 0,
      coupon: null,
      items
    }
  }

  const handleCouponApplied = (id: string, discount: number) => {
    setCouponId(id || null)
    setCouponDiscount(discount)

    // Update form data with coupon ID
    setFormData((prev) => ({
      ...prev,
      couponId: id || null
    }))
  }

  const handleCreateOrder = async () => {
    try {
      setIsLoading(true)

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

      const orderRequest: CreateOrderRequest = {
        cartId: cartData?.id,
        couponId: couponId || undefined,
        shippingAddress: fullAddress,
        billingAddress: fullAddress,
        paymentMethod: formData.paymentMethod,
        currency: formData.currency,
        wardCode: formData.wardCode,
        districtId: formData.districtId
      }

      console.log('Creating order with request:', orderRequest)

      const response = await orderApi.createOrder(orderRequest)

      if (response.data.isSuccess) {
        // Clear the coupon from localStorage when order is created
        localStorage.removeItem('cartCoupon')

        if (formData.paymentMethod === 'ONLINE') {
          // Redirect to VNPay payment URL
          window.location.href = response.data.data?.paymentUrl || ''
        } else if (formData.paymentMethod === 'COD') {
          // For COD, simply show a confirmation and navigate as needed
          toast.success(
            'Đơn hàng đã được tạo. Bạn sẽ thanh toán khi nhận hàng.'
          )
          navigate({ to: '/order_history' }) // or your desired order confirmation page
        }
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || 'Something went wrong!'
        toast.error(`${errorMessage}`)
      } else {
        toast.error('An unexpected error occurred!')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Update payment methods to only include VNPay
  // Update payment methods to include both VNPay and COD
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'ONLINE',
      name: 'ONLINE',
      icon: vnpayLogo,
      description: 'Thanh toán nhanh chóng và an toàn với VNPay'
    },
    {
      id: 'COD',
      name: 'COD',
      icon: '', // Add a cash icon if available or leave it blank
      description: 'Thanh toán khi nhận hàng'
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
                    onClick={handleCreateOrder}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? 'Đang xử lý...' : 'Thanh toán'}
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
              <OrderSummary
                isCheckoutPage={true}
                onCouponApplied={handleCouponApplied}
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
