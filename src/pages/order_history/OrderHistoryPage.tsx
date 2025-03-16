/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Loader2, Package, ShoppingBag } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import orderApi from '@/lib/services/orderApi'
import { format } from 'date-fns'
import cosmeticApi from '@/lib/services/cosmeticApi'
import { OrderStatus, OrderStatusType } from '@/lib/constants/orderStatus'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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

interface OrderItem {
  cosmeticId: string
  quantity: number
  sellingPrice: number
  subTotal: number
}

interface Order {
  id: string
  orderDate: string
  status: string
  totalPrice: number
  orderItems: OrderItem[]
  trackingNumber: string
  shippingAddress: string
  deliveryDate: string
}

// Helper function to normalize status case and ensure type safety
const normalizeStatus = (status: string): OrderStatusType => {
  if (!status) return OrderStatus.PENDING;
  return status.toUpperCase() as OrderStatusType;
}

// Helper function to get status color
const getStatusColor = (status: string) => {
  const normalizedStatus = normalizeStatus(status);

  switch (normalizedStatus) {
    case OrderStatus.CONFIRMED:
      return 'bg-[#D1E2C4] text-[#3A4D39]'
    case OrderStatus.PENDING:
      return 'bg-yellow-100 text-yellow-700'
    case OrderStatus.DELIVERY:
      return 'bg-blue-100 text-blue-700'
    case OrderStatus.COMPLETED:
      return 'bg-green-100 text-green-700'
    case OrderStatus.CANCELLED:
    case OrderStatus.FAILED:
    case OrderStatus.EXPIRED:
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const CANCELLABLE_STATUSES: OrderStatusType[] = [OrderStatus.PENDING]

const OrderCard = ({ order }: { order: Order }) => {
  const navigate = useNavigate()
  const [cosmeticNames, setCosmeticNames] = useState<Record<string, string>>({})
  const [isCancelling, setIsCancelling] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    const fetchCosmeticNames = async () => {
      const namesMap: Record<string, string> = {}
      for (const item of order.orderItems) {
        try {
          const response = await cosmeticApi.getCosmeticById(item.cosmeticId)
          if (response.data.isSuccess) {
            namesMap[item.cosmeticId] = response.data.data?.name || ''
          }
        } catch (error) {
          console.error('Error fetching cosmetic name:', error)
        }
      }
      setCosmeticNames(namesMap)
    }

    fetchCosmeticNames()
  }, [order.orderItems])

  const handleViewDetails = () => {
    navigate({ to: '/order_track', search: { orderId: order.id } })
  }

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return
    }

    setIsCancelling(true)
    try {
      await orderApi.cancelOrder(order.id)
      toast.success('Order cancelled successfully')
      queryClient.invalidateQueries({ queryKey: ['myOrders'] })
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error('Failed to cancel order')
    } finally {
      setIsCancelling(false)
    }
  }

  const canCancel = CANCELLABLE_STATUSES.includes(normalizeStatus(order.status))

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className="overflow-hidden border-rose-200/50">
        <CardHeader className="border-b border-rose-200/50 bg-[#F5F5F5] p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-[#3A4D39]">
                Order #{order.id.slice(0, 8)}
              </CardTitle>
              <CardDescription>
                {format(new Date(order.orderDate), 'MMM dd, yyyy')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn('px-2 py-1', getStatusColor(order.status))}>
                {normalizeStatus(order.status).replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Order Items Summary */}
            <div className="space-y-2">
              {order.orderItems.map((item) => (
                <div
                  key={item.cosmeticId}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-[#3A4D39]">
                    {cosmeticNames[item.cosmeticId]} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(item.sellingPrice)}
                  </span>
                </div>
              ))}
            </div>

            {/* Shipping Info */}
            {order.trackingNumber && (
              <div className="rounded-md bg-[#F5F5F5] p-3 text-sm">
                <div className="flex items-center gap-2 text-[#3A4D39]">
                  <Package className="size-4" />
                  <span>Tracking: {order.trackingNumber}</span>
                </div>
              </div>
            )}

            {/* Total and Actions */}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="space-y-1">
                <span className="text-sm text-[#3A4D39]/70">Total Amount</span>
                <p className="font-medium text-[#3A4D39]">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(order.totalPrice)}
                </p>
              </div>
              <div className="flex gap-2">
                {canCancel && (
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Order'
                    )}
                  </Button>
                )}
                <Button
                  variant="default"
                  className="bg-[#3A4D39] hover:bg-[#4A5D49]"
                  onClick={handleViewDetails}
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate()

  // Add this effect to listen for the refresh event
  useEffect(() => {
    // Function to handle the refresh event
    const handleOrderRefresh = () => {
      console.log('Order refresh event received')
      // Call your function to fetch orders here
      fetchOrders()
    }

    // Check if we need to refresh on mount
    const needsRefresh = localStorage.getItem('refreshOrders') === 'true'
    if (needsRefresh) {
      console.log('Refreshing orders from localStorage flag')
      fetchOrders()
      localStorage.removeItem('refreshOrders')
    }

    // Add event listener
    window.addEventListener('order-refresh-needed', handleOrderRefresh)

    // Cleanup
    return () => {
      window.removeEventListener('order-refresh-needed', handleOrderRefresh)
    }
  }, [])

  // Fetch orders using the API
  const {
    data: ordersData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const response = await orderApi.getMyOrders()
      if (response.data.isSuccess) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch orders')
    }
  })

  const fetchOrders = async () => {
    // Your existing code to fetch orders
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="mr-2 size-8 animate-spin text-[#3A4D39]" />
        <span className="text-lg text-[#3A4D39]">Loading your orders...</span>
      </div>
    )
  }

  if (error) {
    toast.error('Failed to load orders')
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="mb-4 rounded-full bg-red-100 p-3">
          <Package className="size-8 text-red-500" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-[#3A4D39]">
          Error Loading Orders
        </h2>
        <p className="text-[#3A4D39]/70">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-orange-50/80 to-white"
    >
      <div className="mb-8 w-full bg-[#fff9f1] py-4 shadow-sm">
        <div className="mx-auto flex max-w-4xl justify-center gap-4">
          <Button
            variant="outline"
            className="border-rose-200 bg-white"
            onClick={() => navigate({ to: '/account_manage' })}
          >
            Account Settings
          </Button>
          <Button
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            Order History
          </Button>
        </div>
      </div>

      <div className="px-4 pb-16">
        <div className="mx-auto max-w-6xl">
          <motion.section variants={itemVariants} className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-rose-100 px-4 py-2 text-sm text-rose-500">
              Order History
            </span>
            <h1 className="mb-4 text-4xl font-semibold text-[#3A4D39]">
              Your Orders
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-[#3A4D39]/80">
              Track and manage all your orders in one place
            </p>
          </motion.section>

          {ordersData && ordersData.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ordersData.map((order) => (
                <OrderCard
                  key={order.id || ''}
                  order={{
                    id: order.id || '',
                    orderDate: order.orderDate || '',
                    status: order.status || '',
                    totalPrice: order.totalPrice || 0,
                    orderItems: (order.orderItems || []).map(item => ({
                      cosmeticId: item.cosmeticId || '',
                      quantity: item.quantity || 0,
                      sellingPrice: item.sellingPrice || 0,
                      subTotal: item.sellingPrice * item.quantity || 0 // Calculate subTotal
                    })),
                    trackingNumber: order.trackingNumber || '',
                    shippingAddress: order.shippingAddress || '',
                    deliveryDate: order.deliveryDate || ''
                  }}
                />
              ))}
            </div>
          ) : (
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center justify-center rounded-lg border border-rose-200/50 bg-white p-12 text-center shadow-sm"
            >
              <div className="mb-4 rounded-full bg-orange-50 p-6">
                <ShoppingBag className="size-12 text-[#3A4D39]/40" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-[#3A4D39]">
                No Orders Yet
              </h2>
              <p className="mb-6 text-[#3A4D39]/70">
                You haven&apos;t placed any orders yet. Start shopping to see your
                orders here.
              </p>
              <Button
                className="bg-[#3A4D39] hover:bg-[#4A5D49]"
                onClick={() => (window.location.href = '/shop')}
              >
                Browse Products
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default OrderHistoryPage
