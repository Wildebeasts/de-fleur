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
  AlertTriangle
} from 'lucide-react'
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
  PENDING_PAYMENT: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  DELIVERY: 3,
  COMPLETED: 4,
  REFUNDED: -1,
  CANCELLED: -1,
  PAYMENT_FAILED: -1,
  EXPIRED: -1
}

// Status icons
const statusIcons = {
  PENDING_PAYMENT: <Clock className="size-5" />,
  CONFIRMED: <CheckCircle className="size-5" />,
  PROCESSING: <Package className="size-5" />,
  DELIVERY: <Truck className="size-5" />,
  COMPLETED: <Home className="size-5" />,
  REFUNDED: <RefreshCw className="size-5" />,
  CANCELLED: <XCircle className="size-5" />,
  PAYMENT_FAILED: <AlertTriangle className="size-5" />,
  EXPIRED: <AlertTriangle className="size-5" />
}

// Status descriptions
const statusDescriptions = {
  PENDING_PAYMENT: 'Your order is awaiting payment confirmation',
  CONFIRMED: 'Your order has been confirmed and is being processed',
  PROCESSING: 'We are preparing your items for shipment',
  DELIVERY: 'Your order is on its way to you',
  COMPLETED: 'Your order has been delivered successfully',
  REFUNDED: 'Your order has been refunded',
  CANCELLED: 'Your order has been cancelled',
  PAYMENT_FAILED: 'Payment for your order failed',
  EXPIRED: 'Your order has expired'
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

const OrderTrackingPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('')
  const [searchedOrder, setSearchedOrder] = useState('')
  const { orderId } = OrderTrackRoute.useSearch()

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

    const statusString = normalizeStatus(orderData.status)
    return orderStatusSteps[statusString as keyof typeof orderStatusSteps] ?? 0
  }

  // Get status type for Ant Design Steps
  const getStepStatus = (status: string) => {
    const normalizedStatus = normalizeStatus(status);
    
    switch (normalizedStatus) {
      case 'COMPLETED':
        return 'finish'
      case 'CANCELLED':
      case 'PAYMENT_FAILED':
      case 'EXPIRED':
        return 'error'
      case 'REFUNDED':
        return 'warning'
      default:
        return 'process'
    }
  }

  // Add this query inside your component
  const { data: cosmeticData } = useQuery({
    queryKey: ['cosmetic', orderData?.orderItems?.[0]?.cosmeticId],
    queryFn: async () => {
      if (!orderData?.orderItems?.[0]?.cosmeticId) return null
      const response = await cosmeticApi.getCosmeticById(
        orderData.orderItems[0].cosmeticId
      )
      if (response.data.isSuccess) {
        return response.data.data
      }
      throw new Error(
        response.data.message || 'Failed to fetch cosmetic details'
      )
    },
    enabled: !!orderData?.orderItems?.[0]?.cosmeticId
  })

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
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      getStatusColor(orderData.status)
                    }`}
                  >
                    {formatStatus(orderData.status ?? '')}
                  </span>
                </div>

                <Steps
                  current={getCurrentStep()}
                  status={
                    getStepStatus(orderData.status)
                  }
                  items={stepItems.map((item, index) => ({
                    ...item,
                    status:
                      index === getCurrentStep()
                        ? normalizeStatus(orderData.status) === 'COMPLETED' || 
                          normalizeStatus(orderData.status) === 'DELIVERED'
                          ? 'finish'
                          : 'process'
                        : index < getCurrentStep()
                          ? 'finish'
                          : 'wait'
                  }))}
                  direction="horizontal"
                  labelPlacement="vertical"
                />

                {[
                  'CANCELLED',
                  'PAYMENT_FAILED',
                  'EXPIRED',
                  'REFUNDED'
                ].includes(orderData.status ?? '') && (
                    <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                      <div className="flex items-center">
                        <AlertTriangle className="mr-2 size-4" />
                        <span className="font-medium">
                          {orderData.status === 'REFUNDED'
                            ? 'Order Refunded'
                            : 'Order Cancelled'}
                        </span>
                      </div>
                      <p className="mt-1">
                        {orderData.status === 'REFUNDED'
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
                  {orderData.orderItems?.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b border-[#3A4D39]/10 pb-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-md bg-[#D1E2C4]/30"></div>
                        <div>
                          <p className="font-medium text-[#3A4D39]">
                            {cosmeticData
                              ? cosmeticData.name
                              : `Product ${index + 1}`}
                          </p>
                          <p className="text-sm text-[#3A4D39]/70">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium text-[#3A4D39]">
                        {formatToVND(item.sellingPrice)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 text-lg font-semibold text-[#3A4D39]">
                    <span>Total:</span>
                    <span>{formatToVND(orderData.totalPrice ?? 0)}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
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
