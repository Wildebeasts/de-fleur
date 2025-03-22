import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import orderApi from '@/lib/services/orderApi'
import cosmeticApi from '@/lib/services/cosmeticApi'
import {
  Loader2,
  Package,
  ArrowLeft,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  ShoppingBag
} from 'lucide-react'
import { OrderStatus } from '@/lib/constants/orderStatus'

// Type definitions
interface OrderItem {
  cosmeticId: string
  quantity: number
  sellingPrice: number
  // Making subTotal optional to match API response
  subTotal?: number
}

interface OrderData {
  id: string
  orderDate: string
  status: string
  totalPrice: number
  orderItems: OrderItem[]
  trackingNumber?: string
  shippingAddress?: string
  deliveryDate?: string
}

interface ProductData {
  id: string
  name?: string
  thumbnailUrl?: string | null
  cosmeticImages?: Array<{
    id: string
    imageUrl: string
    [key: string]: unknown // Using unknown instead of any
  }>
  price?: number
  [key: string]: unknown // Using unknown instead of any
}

// Status configuration
const orderStatusSteps = {
  Pending: 0,
  'Pending Payment': 0,
  Processing: 1,
  Shipped: 2,
  Delivery: 2,
  Delivered: 3,
  Completed: 3
}

// Format currency to VND
const formatToVND = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

const MobileOrderTrackingPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Get orderId from search params - using a more robust approach
  const searchParams = new URLSearchParams(window.location.search)
  const orderId = searchParams.get('orderId')
  const [searchedOrder, setSearchedOrder] = useState<string | null>(null)

  // Set the orderId from URL if available
  useEffect(() => {
    if (orderId) {
      console.log('Order ID from URL:', orderId)
      setSearchedOrder(orderId)

      // Force a fetch for fresh data every time
      queryClient.invalidateQueries({
        queryKey: ['orders', 'myOrders']
      })
    } else {
      console.log('No order ID found in URL parameters')
      navigate({ to: '/order_history' })
    }
  }, [orderId, navigate, queryClient])

  // Query for fetching all orders with stable caching
  const {
    data: allOrders,
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['orders', 'myOrders'], // Stable query key without timestamp
    queryFn: async () => {
      try {
        console.log('Fetching orders...')
        const response = await orderApi.getMyOrders()
        if (response.data.isSuccess && response.data.data) {
          console.log('Orders fetched successfully:', response.data.data.length)
          return response.data.data as OrderData[]
        }
        console.error('Failed to fetch orders:', response.data.message)
        throw new Error(response.data.message || 'Failed to fetch orders')
      } catch (error) {
        console.error('Error fetching orders:', error)
        throw error
      }
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus to prevent flicker
    retry: 1, // Retry failed requests once
    refetchOnMount: true // Always refetch when component mounts
  })

  // Find the specific order from all orders
  const orderData = React.useMemo<OrderData | null>(() => {
    if (!searchedOrder || !allOrders) {
      console.log('Cannot find order: searchedOrder or allOrders is null', {
        searchedOrder,
        hasOrders: !!allOrders,
        ordersCount: allOrders?.length
      })
      return null
    }

    const foundOrder = allOrders.find((order) => order.id === searchedOrder)
    console.log('Order search result:', foundOrder ? 'Found' : 'Not found', {
      searchedOrder,
      ordersCount: allOrders.length
    })

    return foundOrder || null
  }, [searchedOrder, allOrders])

  // Get product IDs from order items
  const productIds = React.useMemo(() => {
    if (!orderData?.orderItems) return []
    return [...new Set(orderData.orderItems.map((item) => item.cosmeticId))]
  }, [orderData])

  // Query to get product details for order items
  const {
    data: cosmeticsData = {},
    isLoading: isLoadingCosmetics,
    error: cosmeticsError
  } = useQuery({
    queryKey: ['products', 'order', orderData?.id, productIds], // Stable query key
    queryFn: async () => {
      if (!productIds.length) return {}

      console.log(
        'Fetching product details for order items:',
        productIds.length
      )
      // Create a map to store product details by ID
      const productDetails: Record<string, ProductData> = {}

      // Use Promise.all for parallel fetching
      await Promise.all(
        productIds.map(async (id) => {
          try {
            console.log('Fetching product data for:', id)
            const response = await cosmeticApi.getCosmeticById(id)
            if (response.data.isSuccess && response.data.data) {
              // Use unknown as intermediate step for type safety
              const data = response.data.data as unknown as ProductData
              productDetails[id] = data
            }
          } catch (error) {
            console.error(`Failed to fetch details for product ${id}`, error)
          }
        })
      )

      return productDetails
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5 minutes
    enabled: productIds.length > 0 && !!orderData,
    retry: 1
  })

  // Helper function to normalize status text
  function normalizeStatus(status: string): string {
    return status
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    const upperStatus = status.toUpperCase()
    switch (upperStatus) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-700'
      case OrderStatus.PROCESSING:
        return 'bg-blue-100 text-blue-700'
      case OrderStatus.DELIVERY:
        return 'bg-indigo-100 text-indigo-700'
      case OrderStatus.COMPLETED:
        return 'bg-green-100 text-green-700'
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Prepare normalized status if order data exists
  const normalizedStatus = orderData
    ? normalizeStatus(orderData.status || '')
    : ''

  // Get current step based on order status
  const getCurrentStep = () => {
    if (!orderData) return 0
    return (
      orderStatusSteps[normalizedStatus as keyof typeof orderStatusSteps] ?? 0
    )
  }

  // Basic loading state for initial fetch
  if (isLoadingOrders && !allOrders) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <Loader2 className="mb-4 size-10 animate-spin text-[#3A4D39]" />
          <p className="text-[#3A4D39]">Loading order details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (ordersError || (productIds.length > 0 && cosmeticsError)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
        <div className="mb-6 rounded-full bg-red-50 p-4">
          <Package className="size-10 text-red-500" />
        </div>
        <h1 className="mb-2 text-xl font-semibold text-[#3A4D39]">
          Error Loading Order
        </h1>
        <p className="mb-6 text-center text-[#3A4D39]/70">
          We couldn&apos;t load your order details. Please try again.
        </p>
        <motion.button
          className="w-full rounded-md bg-[#3A4D39] px-6 py-3 text-white"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => refetchOrders()}
        >
          Try Again
        </motion.button>
      </div>
    )
  }

  // No order found
  if (allOrders && searchedOrder && !orderData) {
    return (
      <div className="min-h-screen bg-white pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="mr-3 rounded-full p-2 active:bg-gray-100"
                onClick={() => navigate({ to: '/order_history' })}
              >
                <ArrowLeft className="size-5 text-[#3A4D39]" />
              </button>
              <h1 className="text-xl font-semibold text-[#3A4D39]">
                Track Order
              </h1>
            </div>
          </div>
        </div>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 rounded-full bg-gray-50 p-6">
            <Search className="size-10 text-gray-300" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-800">
            Order Not Found
          </h2>
          <p className="mb-8 text-gray-500">
            We couldn&apos;t find order #
            {searchedOrder ? searchedOrder.slice(0, 8) : ''} in your order
            history.
          </p>
          <motion.button
            className="w-full rounded-md bg-[#3A4D39] px-6 py-3 text-white"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate({ to: '/order_history' })}
          >
            Back to Orders
          </motion.button>
        </motion.div>
      </div>
    )
  }

  // Main order display - show if we have order data even if some cosmetics are still loading
  if (orderData) {
    return (
      <div className="min-h-screen bg-white pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="mr-3 rounded-full p-2 active:bg-gray-100"
                onClick={() => navigate({ to: '/order_history' })}
              >
                <ArrowLeft className="size-5 text-[#3A4D39]" />
              </button>
              <h1 className="text-xl font-semibold text-[#3A4D39]">
                Track Order
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Order header */}
            <motion.div
              className="rounded-lg border border-gray-100 bg-white p-4"
              variants={itemVariants}
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium text-gray-800">
                  Order #{orderData.id?.slice(0, 8) || 'N/A'}
                </h3>
                <div
                  className={`rounded-full px-2 py-1 text-xs ${getStatusColor(orderData.status || '')}`}
                >
                  {normalizedStatus}
                </div>
              </div>

              <div className="text-xs text-gray-500">
                {orderData.orderDate &&
                  format(new Date(orderData.orderDate), 'MMMM dd, yyyy')}
              </div>

              {orderData.trackingNumber && (
                <div className="mt-2 flex items-center gap-2 rounded-md bg-gray-50 p-2 text-xs">
                  <span className="font-medium">Tracking:</span>
                  <span className="font-mono">{orderData.trackingNumber}</span>
                </div>
              )}
            </motion.div>

            {/* Progress tracker */}
            <motion.div
              className="rounded-lg border border-gray-100 bg-white p-4"
              variants={itemVariants}
            >
              <h3 className="mb-4 font-medium text-gray-800">Order Progress</h3>

              <div className="relative mb-10 mt-6">
                {/* Progress line */}
                <div className="absolute left-0 top-4 h-1 w-full bg-gray-200"></div>

                {/* Colored progress */}
                <div
                  className="absolute left-0 top-4 h-1 bg-[#3A4D39]"
                  style={{
                    width: `${Math.min(100, (getCurrentStep() / 3) * 100)}%`
                  }}
                ></div>

                {/* Steps */}
                <div className="relative flex justify-between">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex size-8 items-center justify-center rounded-full border-2 ${
                        getCurrentStep() >= 0
                          ? 'border-[#3A4D39] bg-[#3A4D39] text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {getCurrentStep() > 0 ? (
                        <CheckCircle2 className="size-5" />
                      ) : (
                        <ShoppingBag className="size-4" />
                      )}
                    </div>
                    <span className="mt-2 text-center text-xs">Ordered</span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex size-8 items-center justify-center rounded-full border-2 ${
                        getCurrentStep() >= 1
                          ? 'border-[#3A4D39] bg-[#3A4D39] text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {getCurrentStep() > 1 ? (
                        <CheckCircle2 className="size-5" />
                      ) : (
                        <Clock className="size-4" />
                      )}
                    </div>
                    <span className="mt-2 text-center text-xs">Processing</span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex size-8 items-center justify-center rounded-full border-2 ${
                        getCurrentStep() >= 2
                          ? 'border-[#3A4D39] bg-[#3A4D39] text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {getCurrentStep() > 2 ? (
                        <CheckCircle2 className="size-5" />
                      ) : (
                        <Truck className="size-4" />
                      )}
                    </div>
                    <span className="mt-2 text-center text-xs">Shipped</span>
                  </div>

                  {/* Step 4 */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex size-8 items-center justify-center rounded-full border-2 ${
                        getCurrentStep() >= 3
                          ? 'border-[#3A4D39] bg-[#3A4D39] text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      <CheckCircle2 className="size-4" />
                    </div>
                    <span className="mt-2 text-center text-xs">Delivered</span>
                  </div>
                </div>
              </div>

              {/* Status message */}
              <div className="rounded-md bg-gray-50 p-3 text-sm">
                {getCurrentStep() === 0 && (
                  <p>Your order has been placed and is awaiting processing.</p>
                )}
                {getCurrentStep() === 1 && (
                  <p>
                    Your order is being processed and prepared for shipment.
                  </p>
                )}
                {getCurrentStep() === 2 && (
                  <p>Your order has been shipped and is on its way to you.</p>
                )}
                {getCurrentStep() === 3 && (
                  <p>Your order has been delivered. Enjoy your products!</p>
                )}
              </div>
            </motion.div>

            {/* Delivery details */}
            <motion.div
              className="rounded-lg border border-gray-100 bg-white p-4"
              variants={itemVariants}
            >
              <h3 className="mb-3 font-medium text-gray-800">
                Delivery Details
              </h3>

              <div className="space-y-2 text-sm">
                {orderData.shippingAddress && (
                  <div>
                    <div className="text-xs text-gray-500">
                      Shipping Address
                    </div>
                    <div>{orderData.shippingAddress}</div>
                  </div>
                )}

                {orderData.deliveryDate && (
                  <div>
                    <div className="text-xs text-gray-500">
                      Expected Delivery
                    </div>
                    <div>
                      {format(
                        new Date(orderData.deliveryDate),
                        'MMMM dd, yyyy'
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Order items - with loading state for product details */}
            <motion.div
              className="rounded-lg border border-gray-100 bg-white p-4"
              variants={itemVariants}
            >
              <h3 className="mb-3 font-medium text-gray-800">Order Items</h3>

              {isLoadingCosmetics &&
              productIds.length > 0 &&
              !Object.keys(cosmeticsData).length ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="size-6 animate-spin text-[#3A4D39]" />
                </div>
              ) : (
                <div className="space-y-3">
                  {orderData.orderItems?.map((item, idx) => {
                    // Get product details from the map
                    const productData = cosmeticsData?.[item.cosmeticId] as
                      | ProductData
                      | undefined

                    // Get image URL with thumbnail prioritized
                    const imageUrl = productData
                      ? productData.thumbnailUrl ||
                        (productData.cosmeticImages &&
                        productData.cosmeticImages.length > 0
                          ? productData.cosmeticImages[0].imageUrl
                          : '')
                      : ''

                    return (
                      <motion.div
                        key={`${item.cosmeticId}-${idx}`}
                        className="flex items-center gap-3 border-b border-gray-100 pb-3"
                        whileHover={{
                          backgroundColor: 'rgba(58, 77, 57, 0.03)'
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="size-16 shrink-0 overflow-hidden rounded-md bg-gray-50">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={productData?.name || `Product ${idx + 1}`}
                              className="size-full rounded-md object-contain"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center">
                              <Package className="size-6 text-gray-300" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="font-medium">
                            {productData
                              ? productData.name
                              : `Product ${idx + 1}`}
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Qty: {item.quantity}</span>
                            <span className="font-medium text-[#3A4D39]">
                              {formatToVND(item.sellingPrice)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              <div className="mt-3 flex justify-between border-t border-gray-100 pt-3">
                <span className="font-medium">Total</span>
                <span className="font-bold text-[#3A4D39]">
                  {formatToVND(orderData.totalPrice || 0)}
                </span>
              </div>
            </motion.div>

            {/* Contact support */}
            <motion.div
              className="rounded-lg border border-gray-100 bg-white p-4 text-center"
              variants={itemVariants}
            >
              <p className="mb-3 text-sm text-gray-600">
                Need help with your order?
              </p>
              <motion.button
                className="w-full rounded-md border border-[#3A4D39] py-2 text-sm font-medium text-[#3A4D39]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate({ to: '/order_history' })}
              >
                Contact Support
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Fallback default - loading state
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <Loader2 className="mb-4 size-10 animate-spin text-[#3A4D39]" />
        <p className="text-[#3A4D39]">Loading order details...</p>
      </div>
    </div>
  )
}

export default MobileOrderTrackingPage
