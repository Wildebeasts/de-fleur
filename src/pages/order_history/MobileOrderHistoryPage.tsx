import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { toast } from 'sonner'
import orderApi from '@/lib/services/orderApi'
import cosmeticApi from '@/lib/services/cosmeticApi'
import { Loader2, Package, ShoppingBag, ArrowLeft } from 'lucide-react'
import { OrderStatus } from '@/lib/constants/orderStatus'
import cartApi from '@/lib/services/cartApi'

// Types from existing OrderHistoryPage
interface OrderItem {
  cosmeticId?: string
  quantity?: number
  sellingPrice?: number
  subTotal?: number
}

interface Order {
  id?: string | undefined
  orderDate?: string
  status?: string
  totalPrice?: number
  orderItems?: OrderItem[]
  trackingNumber?: string
  shippingAddress?: string
  deliveryDate?: string
}

interface ProductDetail {
  id: string
  name: string
  thumbnailUrl?: string // Primary image source
  cosmeticImages?: {
    // Backup image source
    id: string
    cosmeticId: string
    cosmeticName: string
    imageUrl: string
  }[]
  price?: number
  description?: string
}

// Format currency to VND
const formatToVND = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const MobileOrderHistoryPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date-desc')
  const [buyingAgain, setBuyingAgain] = useState<Record<string, boolean>>({})

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

  // Fetch orders with improved caching
  const {
    data: ordersData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['orders', 'myOrders'],
    queryFn: async () => {
      const response = await orderApi.getMyOrders()
      if (response.data.isSuccess) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch orders')
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  // Extract all unique product IDs from orders
  const productIds = React.useMemo(() => {
    if (!ordersData) return []

    const ids = new Set<string>()
    ordersData.forEach((order: Order) => {
      order.orderItems?.forEach((item: OrderItem) => {
        if (item.cosmeticId) {
          ids.add(item.cosmeticId)
        }
      })
    })

    return Array.from(ids)
  }, [ordersData])

  // Fetch all product details using React Query
  const { data: productsData = {} } = useQuery({
    queryKey: ['products', 'bulk', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return {}

      const productDetails: Record<string, ProductDetail> = {}

      // Use Promise.all to fetch all products in parallel
      await Promise.all(
        productIds.map(async (id) => {
          try {
            const response = await cosmeticApi.getCosmeticById(id)
            if (response.data.isSuccess && response.data.data) {
              productDetails[id] = {
                id: response.data.data.id,
                name: response.data.data.name || 'Product',
                // Type assertion to handle the mismatch
                cosmeticImages: (response.data.data.cosmeticImages ||
                  []) as unknown as {
                  id: string
                  cosmeticId: string
                  cosmeticName: string
                  imageUrl: string
                }[],
                thumbnailUrl: response.data.data.thumbnailUrl || undefined,
                price: response.data.data.price
              }
            }
          } catch (err) {
            console.error(`Failed to fetch product ${id}`, err)
            productDetails[id] = {
              id: id,
              name: 'Product',
              cosmeticImages: []
            }
          }
        })
      )

      return productDetails
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: productIds.length > 0
  })

  // Effect to listen for refresh events
  React.useEffect(() => {
    const handleOrderRefresh = () => {
      // Invalidate orders cache when refresh is needed
      queryClient.invalidateQueries({ queryKey: ['orders', 'myOrders'] })
    }

    const needsRefresh = localStorage.getItem('refreshOrders') === 'true'
    if (needsRefresh) {
      handleOrderRefresh()
      localStorage.removeItem('refreshOrders')
    }

    window.addEventListener('order-refresh-needed', handleOrderRefresh)
    return () => {
      window.removeEventListener('order-refresh-needed', handleOrderRefresh)
    }
  }, [queryClient])

  // Helper function to format status text
  const normalizeStatus = (status: string) => {
    return status
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Filter orders by status
  const filteredOrders = React.useMemo(() => {
    if (!ordersData) return []

    return ordersData.filter((order: Order) => {
      if (statusFilter === 'all') return true

      // Match status filter with order status
      const status = order.status?.toLowerCase() || ''
      return status.includes(statusFilter.toLowerCase())
    })
  }, [ordersData, statusFilter])

  // Sort filtered orders
  const sortedOrders = React.useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      if (sortBy === 'date-desc') {
        return (
          new Date(b.orderDate || 0).getTime() -
          new Date(a.orderDate || 0).getTime()
        )
      } else if (sortBy === 'date-asc') {
        return (
          new Date(a.orderDate || 0).getTime() -
          new Date(b.orderDate || 0).getTime()
        )
      }
      return 0
    })
  }, [filteredOrders, sortBy])

  // Prefetch order details when clicking on track order
  const handleTrackOrder = (
    e: React.MouseEvent,
    orderId: string | undefined
  ) => {
    e.stopPropagation()

    if (orderId) {
      console.log(
        'Prefetching order and product data for tracking page:',
        orderId
      )

      // Pre-store the order ID in localStorage to ensure it persists across page navigations
      localStorage.setItem('lastTrackedOrder', orderId)
      localStorage.setItem('lastOrdersFetch', Date.now().toString())

      // Ensure the order data is cached for the tracking page
      queryClient.setQueryData(['selectedOrder'], orderId)

      navigate({
        to: '/order_track',
        search: { orderId }
      })
    }
  }

  // Add this new function to handle buying again
  const handleBuyAgain = async (e: React.MouseEvent, order: Order) => {
    e.stopPropagation()

    if (!order?.orderItems?.length) {
      toast.error('No items found in this order')
      return
    }

    try {
      // Set loading state for this specific order
      const orderId = order.id || ''
      setBuyingAgain((prev) => ({ ...prev, [orderId]: true }))

      // Add all items from the order to cart
      const promises = order.orderItems.map((item: OrderItem) =>
        cartApi.addToCart(item.cosmeticId || '', item.quantity || 1)
      )

      const results = await Promise.all(promises)

      // Check if all items were added successfully
      const allSuccess = results.every((res) => res.data.isSuccess)

      if (allSuccess) {
        toast.success('All items added to cart')
        // Redirect to checkout
        navigate({ to: '/cart' })
      } else {
        // Some items failed to add
        toast.error("Some items couldn't be added to your cart")
      }
    } catch (error) {
      console.error('Error adding items to cart:', error)
      toast.error('Failed to add items to cart')
    } finally {
      const orderId = order.id || ''
      setBuyingAgain((prev) => ({ ...prev, [orderId]: false }))
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9f9]">
        <div className="flex flex-col items-center">
          <Loader2 className="mb-4 size-10 animate-spin text-[#3A4D39]" />
          <p className="text-[#3A4D39]">Loading your orders...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    toast.error('Failed to load orders')
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f9f9f9] px-4">
        <div className="mb-6 rounded-full bg-red-100 p-4">
          <Package className="size-10 text-red-500" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-[#3A4D39]">
          Error Loading Orders
        </h2>
        <p className="mb-6 text-center text-[#3A4D39]/70">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <button
          className="rounded-full bg-[#3A4D39] px-6 py-3 text-white"
          onClick={() => refetch()}
        >
          Try Again
        </button>
      </div>
    )
  }

  // Main content
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Simple header with dropdown */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="mr-3 rounded-full p-2 active:bg-gray-100"
              onClick={() => navigate({ to: '/account_manage' })}
            >
              <ArrowLeft className="size-5 text-[#3A4D39]" />
            </button>
            <h1 className="text-xl font-semibold text-[#3A4D39]">
              Order History
            </h1>
          </div>

          {/* Dropdown that actually works */}
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-500">By Status</span>
            <select
              className="rounded-md border border-gray-200 bg-white p-1.5 text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Newest</option>
              <option value="date-asc">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Simple filter pills */}
      <div className="border-b border-gray-100">
        {/* eslint-disable-next-line tailwindcss/no-custom-classname */}
        <div className="scrollbar-hide flex overflow-x-auto px-4 py-2">
          <button
            className={`mr-2 whitespace-nowrap rounded-full px-4 py-1.5 text-xs ${statusFilter === 'all' ? 'bg-[#3A4D39] text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setStatusFilter('all')}
          >
            All Orders
          </button>
          <button
            className={`mr-2 whitespace-nowrap rounded-full px-4 py-1.5 text-xs ${statusFilter === 'pending' ? 'bg-[#3A4D39] text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setStatusFilter(OrderStatus.PENDING.toLowerCase())}
          >
            Pending
          </button>
          <button
            className={`mr-2 whitespace-nowrap rounded-full px-4 py-1.5 text-xs ${statusFilter === 'processing' ? 'bg-[#3A4D39] text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() =>
              setStatusFilter(OrderStatus.PROCESSING.toLowerCase())
            }
          >
            Processing
          </button>
          <button
            className={`mr-2 whitespace-nowrap rounded-full px-4 py-1.5 text-xs ${statusFilter === 'delivered' ? 'bg-[#3A4D39] text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setStatusFilter('delivered')}
          >
            Delivered
          </button>
          <button
            className={`mr-2 whitespace-nowrap rounded-full px-4 py-1.5 text-xs ${statusFilter === 'completed' ? 'bg-[#3A4D39] text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </button>
          <button
            className={`mr-2 whitespace-nowrap rounded-full px-4 py-1.5 text-xs ${statusFilter === 'cancelled' ? 'bg-[#3A4D39] text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Clean order cards */}
      <div className="p-4">
        {sortedOrders.length > 0 ? (
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {sortedOrders.map((order) => (
              <motion.div
                key={order.id || `order-${Math.random()}`}
                className="overflow-hidden rounded-lg border border-gray-100 bg-white"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                onClick={() =>
                  navigate({
                    to: '/order_track',
                    search: { orderId: order.id }
                  })
                }
              >
                {/* Improved product images that adapt to item count */}
                <div className="relative">
                  <div className="absolute right-2 top-2 z-10 rounded-full bg-yellow-50 px-2 py-1 text-xs text-yellow-700">
                    {normalizeStatus(order.status || 'Pending Payment')}
                  </div>

                  {/* Adaptive grid based on number of items */}
                  <div
                    className={`
                    grid gap-0.5 bg-white p-2
                    ${
                      order.orderItems?.length === 1
                        ? 'grid-cols-1'
                        : order.orderItems?.length === 2
                          ? 'grid-cols-2 grid-rows-1'
                          : 'grid-cols-2 grid-rows-2'
                    }
                  `}
                  >
                    {order.orderItems?.slice(0, 4).map((item, idx) => {
                      const product = productsData?.[item.cosmeticId]

                      // Simplified image URL retrieval - directly prioritize thumbnailUrl
                      const imageUrl =
                        product?.thumbnailUrl ||
                        (product?.cosmeticImages &&
                        product.cosmeticImages.length > 0
                          ? product.cosmeticImages[0].imageUrl
                          : null)

                      return (
                        <div
                          key={idx}
                          className={`
                            relative flex items-center justify-center overflow-hidden rounded-sm border border-gray-100 bg-gray-50
                            ${order.orderItems?.length === 1 ? 'aspect-[3/2]' : 'aspect-square'}
                          `}
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product?.name || `Product ${idx + 1}`}
                              className="size-full object-contain"
                            />
                          ) : (
                            // Fallback placeholder when no image is available
                            <div className="flex flex-col items-center justify-center p-2 text-center">
                              <Package className="mb-1 size-4 text-gray-400" />
                              <span className="text-[9px] font-medium text-gray-500">
                                {product?.name || `Item ${idx + 1}`}
                              </span>
                              <span className="text-[8px] text-gray-400">
                                {formatToVND(item.sellingPrice || 0)}
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {order.orderItems && order.orderItems.length > 4 && (
                    <div className="absolute bottom-2 right-2 rounded-full bg-gray-800/70 px-1.5 py-0.5 text-xs font-medium text-white">
                      +{order.orderItems.length - 4}
                    </div>
                  )}
                </div>

                {/* Simple order info */}
                <div className="p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">
                      Order #{order.id?.slice(0, 8) || 'N/A'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {order.orderDate &&
                        format(new Date(order.orderDate), 'MMM dd, yyyy')}
                    </p>
                  </div>

                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {order.orderItems?.length || 0} items
                    </p>
                    <p className="font-semibold text-[#3A4D39]">
                      {formatToVND(order.totalPrice || 0)}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      className="rounded-md border border-gray-200 py-2 text-xs font-medium text-gray-700"
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleTrackOrder(e, order.id)}
                    >
                      Track Order
                    </motion.button>
                    <motion.button
                      className="rounded-md bg-[#3A4D39] py-2 text-xs font-medium text-white"
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleBuyAgain(e, order)}
                      disabled={buyingAgain[order.id || '']}
                    >
                      {buyingAgain[order.id || ''] ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="mr-1 size-3 animate-spin" />
                          <span>Adding...</span>
                        </div>
                      ) : (
                        'Buy Again'
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="mt-10 flex flex-col items-center justify-center p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 rounded-full bg-gray-50 p-6">
              <ShoppingBag className="size-10 text-gray-300" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-800">
              No Orders Found
            </h2>
            <p className="mb-8 text-gray-500">
              {statusFilter !== 'all'
                ? `You don't have any ${statusFilter} orders.`
                : "You haven't placed any orders yet."}
            </p>
            <motion.button
              className="w-full rounded-md bg-[#3A4D39] px-6 py-3 text-white"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate({ to: '/shop' })}
            >
              Start Shopping
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default MobileOrderHistoryPage
