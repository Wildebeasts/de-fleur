import orderApi from '@/lib/services/orderApi'
import { OrderResponse } from '@/lib/types/order'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'bg-yellow-100 text-yellow-700 border border-yellow-500'
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-700 border border-blue-500'
    case 'PROCESSING':
      return 'bg-indigo-100 text-indigo-700 border border-indigo-500'
    case 'DELIVERY':
      return 'bg-orange-100 text-orange-700 border border-orange-500'
    case 'COMPLETED':
      return 'bg-green-100 text-green-700 border border-green-500'
    case 'REFUNDED':
      return 'bg-gray-200 text-gray-500 border border-gray-400'
    case 'CANCELLED':
      return 'bg-red-100 text-red-700 border border-red-500'
    case 'PAYMENT_FAILED':
      return 'bg-rose-100 text-rose-700 border border-rose-500'
    case 'EXPIRED':
      return 'bg-gray-300 text-gray-600 border border-gray-500'
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-400'
  }
}

const formatDateVN = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const OrderTracking = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await orderApi.getAllOrders()
      console.log(response)

      setOrders(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      await orderApi.updateOrderStatus(orderId, { status: newStatus })
      toast.success('Order status updated')
      fetchOrders()
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Order Tracking</h2>
      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Coupon</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Shipping Address</TableHead>
              <TableHead>Billing Address</TableHead>
              <TableHead>Tracking Number</TableHead>
              <TableHead>Delivery Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  <div>
                    <span>{order.customerUserName || 'Walk-in'}</span>
                    {order.customerEmail && (
                      <p className="text-xs text-gray-500">
                        {order.customerEmail}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <span>{order.couponName || 'N/A'}</span>
                    {order.couponId && (
                      <p className="text-xs text-gray-500">{order.couponId}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(order.subTotal!)}
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(order.totalPrice!)}
                </TableCell>
                <TableCell>{formatDateVN(order.orderDate!) || 'N/A'}</TableCell>
                <TableCell>{order.shippingAddress || 'N/A'}</TableCell>
                <TableCell>{order.billingAddress || 'N/A'}</TableCell>
                <TableCell>{order.trackingNumber || 'N/A'}</TableCell>
                <TableCell>
                  {formatDateVN(order.deliveryDate!) || 'N/A'}
                </TableCell>
                <TableCell>
                  <div
                    className={cn(
                      'rounded-md px-2 py-1 text-sm font-medium',
                      getStatusStyles(order.status!)
                    )}
                  >
                    {order.status?.replace(/_/g, ' ') || 'Unknown'}
                  </div>
                  <Select
                    defaultValue={order.status}
                    onValueChange={(value) =>
                      handleStatusChange(order.id!, value)
                    }
                    disabled={updating === order.id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING_PAYMENT">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="DELIVERY">Delivery</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="REFUNDED" disabled>
                        Refunded
                      </SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      <SelectItem value="PAYMENT_FAILED" disabled>
                        Failed
                      </SelectItem>
                      <SelectItem value="EXPIRED" disabled>
                        Expired
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleStatusChange(order.id!, 'COMPLETED')}
                    disabled={
                      updating === order.id || order.status === 'COMPLETED'
                    }
                  >
                    Mark as Completed
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default OrderTracking
