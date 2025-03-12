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
import { ArrowRight, Loader2, Package, ShoppingBag } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import orderApi from '@/lib/services/orderApi'
import { format } from 'date-fns'
import cosmeticApi from '@/lib/services/cosmeticApi'

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

// Helper function to normalize status case
const normalizeStatus = (status: string): string => {
  if (!status) return '';
  return status.toUpperCase();
}

// Helper function to format status for display
const formatStatus = (status: string) => {
  return status
    .toUpperCase() // Normalize to uppercase first
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

// Helper function to get status color
const getStatusColor = (status: string) => {
  const normalizedStatus = normalizeStatus(status);
  
  switch (normalizedStatus) {
    case 'CONFIRMED':
      return 'bg-[#D1E2C4] text-[#3A4D39]'
    case 'PENDING_PAYMENT':
      return 'bg-yellow-100 text-yellow-700'
    case 'SHIPPED':
      return 'bg-blue-100 text-blue-700'
    case 'DELIVERED':
    case 'COMPLETED':
      return 'bg-green-100 text-green-700'
    case 'CANCELLED':
    case 'PAYMENT_FAILED':
    case 'EXPIRED':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

// Format date helper
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMMM dd, yyyy')
  } catch (error) {
    return 'Invalid date'
  }
}

const OrderCard = ({ order }: { order: Order }) => {
  const navigate = useNavigate()
  const [cosmeticNames, setCosmeticNames] = useState<Record<string, string>>({})

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

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className="overflow-hidden border-rose-200/50">
        <CardHeader className="bg-orange-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-[#3A4D39]">
                Order #{order.id.substring(0, 8)}...
              </CardTitle>
              <CardDescription>{formatDate(order.orderDate)}</CardDescription>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                order.status
              )}`}
            >
              {formatStatus(order.status)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-4 space-y-2">
            {order.orderItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-[#3A4D39]">
                  {item.quantity}x{' '}
                  {cosmeticNames[item.cosmeticId] || `Product ${index + 1}`}
                </span>
                <span className="font-medium text-[#3A4D39]">
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
          <div className="flex items-center justify-between border-t pt-4">
            <span className="font-medium text-[#3A4D39]">
              Total:{' '}
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(order.totalPrice)}
            </span>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                className="text-[#3A4D39] hover:bg-[#D1E2C4]/10"
                onClick={handleViewDetails}
              >
                View Details <ArrowRight className="ml-2 size-4" />
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const OrderHistoryPage: React.FC = () => {
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
      className="min-h-screen bg-gradient-to-b from-orange-50/80 to-white px-4 py-16"
    >
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
    </motion.div>
  )
}

export default OrderHistoryPage
