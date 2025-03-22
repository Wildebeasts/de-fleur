/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Steps } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Loader2,
  Search,
  Package,
  Truck,
  Home,
  Box,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  AlertTriangle,
  Star
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import orderApi from '@/lib/services/orderApi'
import { Route as OrderTrackRoute } from '@/routes/order_track'
import {
  UserOutlined,
  SolutionOutlined,
  LoadingOutlined,
  SmileOutlined,
  CheckOutlined,
  ShoppingOutlined,
  CarOutlined,
  HomeOutlined
} from '@ant-design/icons'
import cosmeticApi from '@/lib/services/cosmeticApi'
import axios from 'axios'
import feedbackApi from '@/lib/services/feedbackApi'
import { OrderStatus, OrderStatusType } from '@/lib/constants/orderStatus'
import couponApi from '@/lib/services/couponApi'
import { CouponResponse } from '@/lib/types/Coupon'

// Animation variants
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

// Order status mapping for steps
const orderStatusSteps = {
  [OrderStatus.PENDING]: 0,
  [OrderStatus.CONFIRMED]: 1,
  [OrderStatus.PROCESSING]: 2,
  [OrderStatus.DELIVERY]: 3,
  [OrderStatus.COMPLETED]: 4,
  [OrderStatus.REFUNDED]: -1,
  [OrderStatus.CANCELLED]: -1,
  [OrderStatus.FAILED]: -1,
  [OrderStatus.EXPIRED]: -1
}

// Status icons
const statusIcons = {
  [OrderStatus.PENDING]: <Clock className="size-5" />,
  [OrderStatus.CONFIRMED]: <CheckCircle className="size-5" />,
  [OrderStatus.PROCESSING]: <Package className="size-5" />,
  [OrderStatus.DELIVERY]: <Truck className="size-5" />,
  [OrderStatus.COMPLETED]: <Home className="size-5" />,
  [OrderStatus.REFUNDED]: <RefreshCw className="size-5" />,
  [OrderStatus.CANCELLED]: <XCircle className="size-5" />,
  [OrderStatus.FAILED]: <AlertTriangle className="size-5" />,
  [OrderStatus.EXPIRED]: <AlertTriangle className="size-5" />
}

// Status descriptions
const statusDescriptions = {
  [OrderStatus.PENDING]: 'Your order is awaiting payment confirmation',
  [OrderStatus.CONFIRMED]: 'Your order has been confirmed and is being processed',
  [OrderStatus.PROCESSING]: 'We are preparing your items for shipment',
  [OrderStatus.DELIVERY]: 'Your order is on its way to you',
  [OrderStatus.COMPLETED]: 'Your order has been delivered successfully',
  [OrderStatus.REFUNDED]: 'Your order has been refunded',
  [OrderStatus.CANCELLED]: 'Your order has been cancelled',
  [OrderStatus.FAILED]: 'Payment for your order failed',
  [OrderStatus.EXPIRED]: 'Your order has expired'
}

// Helper function to normalize status case
const normalizeStatus = (status: string): string => {
  if (!status) return '';
  return status.toUpperCase();
}

// Format status for display
const formatStatus = (status: string) => {
  return status
    .toUpperCase() // Normalize to uppercase first
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

const stepItems = [
  {
    title: 'Payment',
    description: 'Order placed',
    icon: <UserOutlined />,
    status: 'process'
  },
  {
    title: 'Confirmed',
    description: 'Order confirmed',
    icon: <SolutionOutlined />,
    status: 'wait'
  },
  {
    title: 'Processing',
    description: 'Preparing items',
    icon: <LoadingOutlined />,
    status: 'wait'
  },
  {
    title: 'Shipping',
    description: 'On the way',
    icon: <CarOutlined />,
    status: 'wait'
  },
  {
    title: 'Delivered',
    description: 'Order completed',
    icon: <SmileOutlined />,
    status: 'wait'
  }
]

// Add a helper function to format currency to VND
const formatToVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const getStatusColor = (status: string) => {
  const normalizedStatus = normalizeStatus(status);

  switch (normalizedStatus) {
    case 'CONFIRMED':
      return 'bg-[#D1E2C4] text-[#3A4D39]';
    case 'PENDING_PAYMENT':
      return 'bg-yellow-100 text-yellow-700';
    case 'SHIPPED':
      return 'bg-blue-100 text-blue-700';
    case 'DELIVERED':
    case 'COMPLETED':
      return 'bg-green-100 text-green-700';
    case 'CANCELLED':
    case 'PAYMENT_FAILED':
    case 'EXPIRED':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

// Feedback component for completed orders
const OrderFeedback = ({ cosmeticId, cosmeticName }: { cosmeticId: string, cosmeticName: string }) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await feedbackApi.submitFeedback({
        cosmeticId,
        content: content || null,
        rating
      })

      if (response.data.isSuccess) {
        toast.success('Thank you for your feedback!')
        setSubmitted(true)
      } else {
        toast.error(response.data.message || 'Failed to submit feedback')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('An error occurred while submitting your feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 rounded-lg bg-green-50 p-6 text-center"
      >
        <CheckCircle className="mx-auto mb-4 size-12 text-green-500" />
        <h3 className="mb-2 text-xl font-medium text-[#3A4D39]">
          Thank You for Your Feedback!
        </h3>
        <p className="text-[#3A4D39]/80">
          Your feedback helps us improve our products and services.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-8 rounded-lg bg-orange-50 p-6"
    >
      <h3 className="mb-4 text-lg font-medium text-[#3A4D39]">
        Rate Your Experience with {cosmeticName}
      </h3>

      <div className="mb-6">
        <p className="mb-2 text-sm text-[#3A4D39]/80">How would you rate this product?</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-2xl focus:outline-none"
            >
              <Star
                className={`size-8 ${star <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
                  }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="mt-2 text-sm font-medium text-[#3A4D39]">
            {rating === 1 ? 'Poor' :
              rating === 2 ? 'Fair' :
                rating === 3 ? 'Good' :
                  rating === 4 ? 'Very Good' : 'Excellent'}
          </p>
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm text-[#3A4D39]/80">
          Share your thoughts (optional)
        </label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What did you like or dislike about this product?"
          className="min-h-[100px] resize-none border-rose-200/50"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || rating === 0}
        className="w-full bg-[#3A4D39] hover:bg-[#4A5D49]"
      >
        {isSubmitting ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : null}
        Submit Feedback
      </Button>
    </motion.div>
  )
}

const OrderTrackingPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('')
  const [searchedOrder, setSearchedOrder] = useState('')
  const { orderId } = OrderTrackRoute.useSearch()
  const [couponData, setCouponData] = useState<CouponResponse | null>(null)

  // Set the orderId from URL if available
  useEffect(() => {
    if (orderId) {
      setOrderNumber(orderId)
      setSearchedOrder(orderId)
    }
  }, [orderId])

  // Query for fetching all orders
  const { data: allOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const response = await orderApi.getMyOrders()
      if (response.data.isSuccess) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch orders')
    }
  })

  // Find the specific order from all orders
  const orderData =
    searchedOrder && allOrders
      ? allOrders.find((order: any) => order.id === searchedOrder)
      : null

  const isLoading = isLoadingOrders && !!searchedOrder
  const error = searchedOrder && !orderData && !isLoading

  // Query to get product details for ALL order items
  const { data: cosmeticsData, isLoading: isLoadingCosmetics } = useQuery({
    queryKey: ['order-cosmetics', orderData?.id],
    queryFn: async () => {
      if (!orderData?.orderItems || orderData.orderItems.length === 0) return {}

      // Create a map to store product details by ID
      const productDetails: Record<string, any> = {}

      // Fetch details for each unique product in the order
      const uniqueProductIds = [...new Set(orderData.orderItems.map(item => item.cosmeticId))]

      for (const id of uniqueProductIds) {
        try {
          const response = await cosmeticApi.getCosmeticById(id)
          if (response.data.isSuccess) {
            productDetails[id] = response.data.data
          }
        } catch (error) {
          console.error(`Failed to fetch details for product ${id}`, error)
        }
      }

      return productDetails
    },
    enabled: !!orderData?.orderItems && orderData.orderItems.length > 0
  })

  // Handle search button click
  const handleSearch = () => {
    if (!orderNumber.trim()) {
      toast.error('Please enter an order number')
      return
    }
    setSearchedOrder(orderNumber.trim())
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Get current status step
  const getCurrentStep = () => {
    if (!orderData) return 0

    const statusString = normalizeStatus(orderData.status || '')
    return orderStatusSteps[statusString as keyof typeof orderStatusSteps] ?? 0
  }

  // Get status type for Ant Design Steps
  const getStepStatus = (status: string): "process" | "wait" | "finish" | "error" => {
    const normalizedStatus = normalizeStatus(status);

    switch (normalizedStatus) {
      case OrderStatus.COMPLETED:
        return 'finish'
      case OrderStatus.CANCELLED:
      case OrderStatus.FAILED:
      case OrderStatus.EXPIRED:
      case OrderStatus.REFUNDED:
        return 'error'
      default:
        return 'process'
    }
  }

  // Inside the OrderTrackingPage component, before the return statement
  React.useEffect(() => {
    if (orderData) {
      console.log("Order status:", orderData.status);
      console.log("Normalized status:", normalizeStatus(orderData.status || ''));
      console.log("Order items:", orderData.orderItems);
      console.log("Is completed check:", normalizeStatus(orderData.status || '') === 'COMPLETED');
    }
  }, [orderData]);

  const normalizedStatus = normalizeStatus(orderData?.status || '');

  useEffect(() => {
    if (orderData && orderData.couponId) {
      const fetchCouponData = async () => {
        try {
          const response = await couponApi.getById(orderData.couponId as string)
          setCouponData(response.data.data as CouponResponse)
        } catch (error) {
          console.error('Error fetching coupon data:', error)
        }
      }

      fetchCouponData()
    }
  }, [orderData])

  // Calculate subtotal
  const subtotal = orderData?.orderItems?.reduce((sum, item) => sum + item.sellingPrice, 0) ?? 0;

  // Calculate coupon discount
  const calculateCouponDiscount = () => {
    if (!couponData || !orderData?.couponId) return 0;

    // Calculate discount based on percentage
    const discountAmount = subtotal * (couponData.discount / 100);

    // Apply max discount cap if needed
    return Math.min(discountAmount, couponData.maxDiscountAmount);
  };

  const couponDiscount = calculateCouponDiscount();

  // Calculate shipping fee
  const shippingFee = (orderData?.totalPrice ?? 0) - subtotal + couponDiscount;

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-gradient-to-b from-orange-50/80 to-white px-4 py-16"
      >
        <div className="mx-auto max-w-4xl">
          <motion.section variants={itemVariants} className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-rose-100 px-4 py-2 text-sm text-rose-500">
              Track Your Order
            </span>
            <h1 className="mb-4 text-4xl font-semibold text-[#3A4D39]">
              Order Status
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-[#3A4D39]/80">
              Enter your order number to track your package and view delivery
              status
            </p>
          </motion.section>

          <motion.div
            variants={itemVariants}
            className="mx-auto mb-12 max-w-md"
          >
            <div className="flex gap-2">
              <Input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter order number"
                className="border-rose-200"
              />
              <Button
                className="bg-[#3A4D39] hover:bg-[#4A5D49]"
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
              </Button>
            </div>
          </motion.div>

          {isLoading ? (
            <motion.div
              variants={itemVariants}
              className="flex h-64 items-center justify-center"
            >
              <Loader2 className="mr-2 size-8 animate-spin text-[#3A4D39]" />
              <span className="text-lg text-[#3A4D39]">
                Loading order details...
              </span>
            </motion.div>
          ) : error ? (
            <motion.div
              variants={itemVariants}
              className="rounded-lg border border-rose-200/50 bg-white p-8 text-center shadow-lg"
            >
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
                <span className="text-2xl text-red-500">!</span>
              </div>
              <h3 className="mb-2 text-xl font-medium text-[#3A4D39]">
                Order Not Found
              </h3>
              <p className="text-[#3A4D39]/70">
                We couldn&apos;t find an order with that number. Please check and try
                again.
              </p>
            </motion.div>
          ) : orderData ? (
            <React.Fragment>
              <motion.div
                variants={itemVariants}
                className="rounded-lg border border-rose-200/50 bg-white p-8 shadow-lg"
              >
                <div className="mb-8">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-medium text-[#3A4D39]">
                      Order Status
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(orderData.status || '')
                        }`}
                    >
                      {formatStatus(orderData.status || '')}
                    </span>
                  </div>

                  <Steps
                    current={getCurrentStep()}
                    status={
                      getStepStatus(orderData.status || '')
                    }
                    items={stepItems.map((item, index) => ({
                      ...item,
                      status:
                        index === getCurrentStep()
                          ? normalizedStatus === OrderStatus.COMPLETED ||
                            normalizedStatus === 'DELIVERED'
                            ? 'finish'
                            : 'process'
                          : index < getCurrentStep()
                            ? 'finish'
                            : 'wait'
                    }))}
                    direction="horizontal"
                    labelPlacement="vertical"
                  />

                  {normalizedStatus === OrderStatus.CANCELLED ||
                    normalizedStatus === OrderStatus.FAILED ||
                    normalizedStatus === OrderStatus.EXPIRED ||
                    normalizedStatus === OrderStatus.REFUNDED && (
                      <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                        <div className="flex items-center">
                          <AlertTriangle className="mr-2 size-4" />
                          <span className="font-medium">
                            {normalizedStatus === OrderStatus.REFUNDED
                              ? 'Order Refunded'
                              : 'Order Cancelled'}
                          </span>
                        </div>
                        <p className="mt-1">
                          {normalizedStatus === OrderStatus.REFUNDED
                            ? 'This order has been refunded. The amount will be credited back to your original payment method.'
                            : 'This order has been cancelled and will not be processed further.'}
                        </p>
                      </div>
                    )}
                </div>

                <motion.div
                  variants={itemVariants}
                  className="mt-12 rounded-lg bg-orange-50 p-6"
                >
                  <h3 className="mb-2 text-lg font-medium text-[#3A4D39]">
                    Delivery Details
                  </h3>
                  <div className="grid gap-4 text-sm text-[#3A4D39]/80">
                    <div className="flex justify-between">
                      <span>Order Number:</span>
                      <span className="font-medium">{orderData.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Date:</span>
                      <span className="font-medium">
                        {new Date(orderData.orderDate ?? '').toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Address:</span>
                      <span className="font-medium">
                        {orderData.shippingAddress}
                      </span>
                    </div>
                    {orderData.trackingNumber && (
                      <div className="flex justify-between">
                        <span>Tracking Number:</span>
                        <span className="font-medium">
                          {orderData.trackingNumber}
                        </span>
                      </div>
                    )}
                    {orderData.deliveryDate && (
                      <div className="flex justify-between">
                        <span>Estimated Delivery:</span>
                        <span className="font-medium">
                          {new Date(orderData.deliveryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="mt-8 rounded-lg bg-orange-50 p-6"
                >
                  <h3 className="mb-2 text-lg font-medium text-[#3A4D39]">
                    Order Summary
                  </h3>
                  <div className="mt-8 space-y-4">
                    {orderData.orderItems?.map((item: any, index: number) => {
                      // Get product details from the map
                      const productData = cosmeticsData?.[item.cosmeticId]

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b border-[#3A4D39]/10 pb-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="size-12 overflow-hidden rounded-md bg-[#D1E2C4]/30">
                              {productData ? (
                                <img
                                  src={productData.thumbnailUrl ||
                                    (productData.cosmeticImages &&
                                      productData.cosmeticImages.length > 0
                                      ? productData.cosmeticImages[0].imageUrl
                                      : '')}
                                  alt={productData.name}
                                  className="size-full object-contain"
                                />
                              ) : (
                                <Package className="m-auto size-6 text-[#3A4D39]/30" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-[#3A4D39]">
                                {productData
                                  ? productData.name
                                  : `Product ${index + 1}`}
                              </p>
                              <p className="text-sm text-[#3A4D39]/70">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-medium text-[#3A4D39]">
                              {formatToVND(item.sellingPrice)}
                            </span>
                            {productData && productData.originalPrice && productData.price < productData.originalPrice && (
                              <div className="flex flex-col items-end">
                                <span className="text-sm text-[#3A4D39]/60 line-through">
                                  {formatToVND(productData.originalPrice)}
                                </span>
                                <span className="text-xs text-rose-500">
                                  {Math.round((1 - productData.price / productData.originalPrice) * 100)}% off
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex justify-between pt-2 text-sm text-[#3A4D39]/80">
                      <span>Subtotal:</span>
                      <span>{formatToVND(subtotal)}</span>
                    </div>

                    {couponData && orderData.couponId && (
                      <div className="flex justify-between pt-2 text-sm text-[#3A4D39]/80">
                        <span>Coupon Discount ({couponData.code}):</span>
                        <span className="text-green-600">-{formatToVND(couponDiscount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-2 text-sm text-[#3A4D39]/80">
                      <span>Shipping Fee:</span>
                      <span>{formatToVND(shippingFee)}</span>
                    </div>

                    <div className="mt-2 border-t border-[#3A4D39]/10"></div>

                    <div className="flex justify-between pt-2 text-lg font-semibold text-[#3A4D39]">
                      <span>Total:</span>
                      <span>{formatToVND(orderData.totalPrice ?? 0)}</span>
                    </div>
                  </div>
                </motion.div>

                {(normalizedStatus === OrderStatus.COMPLETED ||
                  normalizedStatus === 'DELIVERED') &&
                  orderData.orderItems &&
                  orderData.orderItems.length > 0 && (
                    <motion.div
                      variants={itemVariants}
                      className="mt-8"
                    >
                      <OrderFeedback
                        cosmeticId={orderData.orderItems[0].cosmeticId}
                        cosmeticName={cosmeticsData?.[orderData.orderItems[0].cosmeticId]?.name || "Product"}
                      />
                    </motion.div>
                  )}
              </motion.div>
            </React.Fragment>
          ) : searchedOrder ? (
            <motion.div
              variants={itemVariants}
              className="rounded-lg border border-rose-200/50 bg-white p-8 text-center shadow-lg"
            >
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-yellow-100">
                <Search className="size-8 text-yellow-500" />
              </div>
              <h3 className="mb-2 text-xl font-medium text-[#3A4D39]">
                No Results
              </h3>
              <p className="text-[#3A4D39]/70">
                We couldn&apos;t find an order with that number. Please check and try
                again.
              </p>
            </motion.div>
          ) : null}
        </div>
      </motion.div>
    </>
  )
}

export default OrderTrackingPage
