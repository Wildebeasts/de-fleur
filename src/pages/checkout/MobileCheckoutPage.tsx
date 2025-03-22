import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ChevronRight, CreditCard } from 'lucide-react'
import vnpayLogo from '@/assets/vnpay.jpg'

import orderApi from '@/lib/services/orderApi'
import { useNavigate } from '@tanstack/react-router'
import cartApi from '@/lib/services/cartApi'
import { useDelivery } from '@/lib/context/DeliveryContext'
import ComboBox from '@/components/ui/combobox'
import { CalculateShippingFeeRequest } from '@/lib/types/delivery'
import { CartItem } from '@/lib/types/Cart'
import couponApi from '@/lib/services/couponApi'
import axios from 'axios'

// Component types
interface PaymentMethod {
  id: string
  name: string
  icon: string
  description: string
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

// Add a Cart interface after existing interfaces
interface Cart {
  items: CartItem[]
  totalPrice: number
}

const MobileCheckoutPage: React.FC = () => {
  // States from desktop version
  const [isLoading, setIsLoading] = useState(false)
  const [isCartLoading, setIsCartLoading] = useState(true)
  const [cartData, setCartData] = useState<Cart | null>(null)
  const [originalSubtotal, setOriginalSubtotal] = useState<number>(0)
  const [finalSubtotal, setFinalSubtotal] = useState<number>(0)
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [couponId, setCouponId] = useState<string | null>(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | null>(
    null
  )
  const [minimumOrderPrice, setMinimumOrderPrice] = useState<number | null>(
    null
  )

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
    resetShippingFee,
    shippingFee
  } = useDelivery()

  const navigate = useNavigate()

  // Form state
  const [formData, setFormData] = useState<ShippingForm>({
    houseNumberStreet: '',
    shippingAddress: '',
    billingAddress: '',
    wardCode: '',
    districtId: 0,
    paymentMethod: 'ONLINE',
    couponId: null,
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
          toast.error('Your cart is empty')
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
  }, [navigate])

  // Get URL parameters
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

      // Fetch coupon details
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

  // Handle form changes
  const handleChange = (name: string, value: string | number) => {
    // For provinceId, also reset dependent fields in one update
    if (name === 'provinceId') {
      const numValue = Number(value)
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
        districtId: 0, // Reset district
        wardCode: '' // Reset ward
      }))

      // Reset shipping fee
      resetShippingFee()

      // Only fetch districts if we have a valid province
      if (numValue !== 0) {
        fetchDistricts(numValue)
      }
    }
    // For districtId, also reset ward in one update
    else if (name === 'districtId') {
      const numValue = Number(value)
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
        wardCode: '' // Reset ward
      }))

      // Reset shipping fee
      resetShippingFee()

      // Only fetch wards if we have a valid district
      if (numValue !== 0) {
        fetchWards(numValue)
      }
    }
    // For other fields, simple update
    else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Calculate actual discount based on coupon
  const calculateActualDiscount = () => {
    if (!cartData) return 0

    const calculatedDiscount = cartData.totalPrice * (couponDiscount / 100)

    // Use discountAmount as fallback when no coupon is applied
    if (couponDiscount === 0 && discountAmount > 0) {
      return discountAmount
    }

    if (maxDiscountAmount && calculatedDiscount > maxDiscountAmount) {
      return maxDiscountAmount
    }

    return calculatedDiscount
  }

  // Build shipping request for API
  const buildShippingRequest = (): CalculateShippingFeeRequest => {
    if (!cartData || !cartData.items.length) {
      return {
        from_district_id: 3695,
        from_ward_code: '90764',
        service_id: 0,
        service_type_id: 2,
        to_district_id: 0,
        to_ward_code: '',
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
        insurance_value: 0,
        cod_failed_amount: 0,
        coupon: null,
        items: []
      }
    }

    const items = cartData.items.map((item) => ({
      code: item.cosmeticId,
      name: item.cosmeticName,
      quantity: item.quantity,
      price: item.price,
      weight: item.weight || 100,
      length: item.length || 10,
      width: item.width || 10,
      height: item.height || 10
    }))

    const totalWeight = items.reduce(
      (sum, item) => sum + (item.weight || 100) * item.quantity,
      0
    )

    // Handle possible empty array for dimensions
    const lengths = items.map((item) => item.length || 10)
    const widths = items.map((item) => item.width || 10)

    const maxLength = lengths.length > 0 ? Math.max(...lengths) : 10
    const maxWidth = widths.length > 0 ? Math.max(...widths) : 10

    const totalHeight = items.reduce(
      (sum, item) => sum + (item.height || 10) * item.quantity,
      0
    )

    // Calculate total price with percentage discount
    const cartTotal = Math.round(cartData.totalPrice || 0)
    const actualDiscount = calculateActualDiscount()
    const finalTotal = cartTotal - actualDiscount

    console.log('Cart Total:', cartTotal)
    console.log('Actual Discount:', actualDiscount)
    console.log('Final Total:', finalTotal)

    return {
      from_district_id: 3695,
      from_ward_code: '90764',
      service_id: 0,
      service_type_id: 2,
      to_district_id: formData.districtId,
      to_ward_code: formData.wardCode,
      weight: Math.max(totalWeight, 50), // Ensure minimum weight
      length: Math.max(maxLength, 10), // Ensure minimum dimensions
      width: Math.max(maxWidth, 10),
      height: Math.max(totalHeight, 10),
      insurance_value: cartTotal - actualDiscount,
      cod_failed_amount: 0,
      coupon: null,
      items
    }
  }

  // Calculate shipping fee when address is complete
  useEffect(() => {
    if (
      formData.provinceId &&
      formData.districtId &&
      formData.wardCode &&
      cartData?.items.length
    ) {
      try {
        calculateShippingFee(buildShippingRequest()).catch((error) => {
          console.error('Error calculating shipping fee:', error)
          toast.error(
            'Could not calculate shipping fee. Please check your address information.'
          )
        })
      } catch (error) {
        console.error('Error in shipping fee calculation:', error)
      }
    }
  }, [
    formData.districtId,
    formData.wardCode,
    formData.provinceId,
    cartData,
    calculateShippingFee
  ])

  // Add this to use the minimumOrderPrice
  const validateMinimumOrderPrice = () => {
    const cartTotal = cartData?.totalPrice || 0
    if (minimumOrderPrice && cartTotal < minimumOrderPrice) {
      toast.error(
        `Minimum order amount for this coupon is ${minimumOrderPrice.toLocaleString('vi-VN')}đ`
      )
      return false
    }
    return true
  }

  // Update the handleSubmit function to use couponId and validateMinimumOrderPrice
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form fields first
    if (!formData.houseNumberStreet.trim()) {
      toast.error('Please enter your street address')
      return
    }

    if (!formData.provinceId || !formData.districtId || !formData.wardCode) {
      toast.error(
        'Please select your complete address (province, district, and ward)'
      )
      return
    }

    // Validate minimum order price if coupon is applied
    if (couponId && !validateMinimumOrderPrice()) {
      return
    }

    try {
      setIsLoading(true)

      // Get the selected location names
      const selectedProvince = provinces.find(
        (p) => p.ProvinceID === formData.provinceId
      )?.ProvinceName
      const selectedDistrict = districts.find(
        (d) => d.DistrictID === formData.districtId
      )?.DistrictName
      const selectedWard = wards.find(
        (w) => w.WardCode === formData.wardCode
      )?.WardName

      // Ensure all location parts are available
      if (!selectedProvince || !selectedDistrict || !selectedWard) {
        toast.error(
          'Invalid address selection. Please select all address fields.'
        )
        return
      }

      // Construct the full address
      const fullAddress = `${formData.houseNumberStreet}, ${selectedWard}, ${selectedDistrict}, ${selectedProvince}`

      // Get couponId from URL parameters
      const searchParams = new URLSearchParams(window.location.search)
      const couponId =
        searchParams.get('couponId')?.replace(/"/g, '') || undefined

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
          if (response.data.data?.paymentUrl) {
            window.location.href = response.data.data.paymentUrl
          } else {
            toast.error('Payment URL not received. Please try again.')
          }
        } else if (formData.paymentMethod === 'COD') {
          // For COD, simply show a confirmation and navigate
          toast.success('Order created. You will pay upon delivery.')
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
        toast.error(`Order failed: ${errorMessage}`)
      } else {
        toast.error('An unexpected error occurred!')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Form validation
  const isShippingFormValid = () => {
    return (
      formData.houseNumberStreet.trim() !== '' &&
      formData.provinceId !== 0 &&
      formData.districtId !== 0 &&
      formData.wardCode !== ''
    )
  }

  // Handle step navigation
  const goToNextStep = () => {
    if (currentStep === 1 && !isShippingFormValid()) {
      toast.error('Please fill in all address fields')
      return
    }

    if (currentStep === 1) {
      setCurrentStep(2) // Go to payment step
    }
  }

  // Payment methods
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
      icon: '', // Use placeholder for COD
      description: 'Pay when you receive the order'
    }
  ]

  // Loading and empty cart states
  if (isCartLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-[#3A4D39] border-t-transparent"></div>
          <p>Loading checkout information...</p>
        </div>
      </div>
    )
  }

  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4">
        <h2 className="mb-4 text-xl font-semibold">Your cart is empty</h2>
        <Button
          className="bg-[#3A4D39] hover:bg-[#4A5D49]"
          onClick={() => navigate({ to: '/shop' })}
        >
          Continue Shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F9F6F0]">
      {/* Header */}
      <div className="bg-[#3A4D39] p-4 text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium">Checkout</h1>
          <div className="flex items-center space-x-1">
            <div className="size-2 rounded-full bg-white"></div>
            <div className="size-2 rounded-full bg-white"></div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="grow p-4">
        {currentStep === 1 && (
          <div>
            <div className="mb-4">
              <label className="block font-medium">Address</label>
              <Input
                placeholder="House number & street"
                value={formData.houseNumberStreet}
                onChange={(e) =>
                  handleChange('houseNumberStreet', e.target.value)
                }
                className="mt-1 w-full rounded-md border border-gray-300 bg-white py-3"
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium">Province</label>
              <ComboBox
                items={provinces.map((p) => ({
                  value: p.ProvinceID.toString(),
                  label: p.ProvinceName
                }))}
                placeholder="Select province"
                value={formData.provinceId}
                onValueChange={(e) => {
                  handleChange('provinceId', e)
                }}
                disabled={isProvincesLoading}
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium">District</label>
              <ComboBox
                items={districts.map((d) => ({
                  value: d.DistrictID.toString(),
                  label: d.DistrictName
                }))}
                placeholder="Select district"
                value={formData.districtId!}
                onValueChange={(e) => {
                  handleChange('districtId', e)
                }}
                disabled={isDistrictsLoading || formData.provinceId === 0}
              />
            </div>

            <div className="mb-6">
              <label className="block font-medium">Ward</label>
              <ComboBox
                items={wards.map((w) => ({
                  value: w.WardCode,
                  label: w.WardName
                }))}
                placeholder="Select ward"
                value={formData.wardCode || ''}
                onValueChange={(e) => {
                  handleChange('wardCode', e)
                }}
                disabled={isWardsLoading || formData.districtId === 0}
              />
            </div>

            <Button
              className="w-full bg-[#3A4D39] py-3 text-white hover:bg-[#4A5D49]"
              onClick={goToNextStep}
            >
              Next <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="mb-4 text-xl font-medium">Payment Method</h2>

            <RadioGroup
              value={formData.paymentMethod}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, paymentMethod: value }))
              }
              className="mb-6 space-y-3"
            >
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center rounded-md border border-gray-200 bg-white p-3"
                >
                  <RadioGroupItem
                    value={method.id}
                    id={method.id}
                    className="mr-3"
                  />
                  <Label
                    htmlFor={method.id}
                    className="flex flex-1 items-center"
                  >
                    {method.id === 'ONLINE' ? (
                      <img
                        src={method.icon}
                        alt={method.name}
                        className="mr-3 h-6 w-auto"
                      />
                    ) : (
                      <CreditCard className="mr-3 size-6 text-gray-500" />
                    )}
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-xs text-gray-500">
                        {method.description}
                      </p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <h2 className="mb-4 text-xl font-medium">Order Summary</h2>

            <div className="mb-4 space-y-3">
              {cartData.items.map((item: CartItem, index: number) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 border-b border-gray-100 pb-3"
                >
                  <img
                    src={item.thumbnailUrl}
                    alt={item.cosmeticName}
                    className="size-16 rounded-md border border-gray-100 object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.cosmeticName}</h3>
                    <p className="text-sm">Quantity: {item.quantity}</p>
                    <p className="font-medium">
                      {item.price.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{originalSubtotal.toLocaleString('vi-VN')}đ</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping fee:</span>
                <span>
                  {shippingFee?.total
                    ? shippingFee.total.toLocaleString('vi-VN') + 'đ'
                    : 'Calculating...'}
                </span>
              </div>

              <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
                <span>Total:</span>
                <span>
                  {(finalSubtotal + (shippingFee?.total || 0)).toLocaleString(
                    'vi-VN'
                  )}
                  đ
                </span>
              </div>
            </div>

            <Button
              className="w-full bg-[#3A4D39] py-3 text-white hover:bg-[#4A5D49]"
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? 'Processing...' : 'Place Order'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileCheckoutPage
