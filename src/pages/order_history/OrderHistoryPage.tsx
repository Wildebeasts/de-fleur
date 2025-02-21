import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

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
  id: string
  name: string
  quantity: number
  price: string
}

interface Order {
  id: string
  date: string
  status: 'Delivered' | 'Processing' | 'Shipped' | 'Cancelled'
  total: string
  items: OrderItem[]
}

const OrderCard = ({ order }: { order: Order }) => (
  <motion.div variants={itemVariants}>
    <Card className="overflow-hidden border-rose-200/50">
      <CardHeader className="bg-orange-50/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-[#3A4D39]">
              Order #{order.id}
            </CardTitle>
            <CardDescription>{order.date}</CardDescription>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              order.status === 'Delivered'
                ? 'bg-[#D1E2C4] text-[#3A4D39]'
                : order.status === 'Processing'
                  ? 'bg-yellow-100 text-yellow-700'
                  : order.status === 'Shipped'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-red-100 text-red-700'
            }`}
          >
            {order.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4 space-y-2">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-[#3A4D39]">
                {item.quantity}x {item.name}
              </span>
              <span className="font-medium text-[#3A4D39]">{item.price}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t pt-4">
          <span className="font-medium text-[#3A4D39]">
            Total: {order.total}
          </span>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              className="text-[#3A4D39] hover:bg-[#D1E2C4]/10"
            >
              View Details <ArrowRight className="ml-2 size-4" />
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

const OrderHistoryPage: React.FC = () => {
  const orders: Order[] = [
    {
      id: '1234',
      date: 'March 15, 2024',
      status: 'Delivered',
      total: '$129.99',
      items: [
        { id: '1', name: 'Vitamin C Serum', quantity: 1, price: '$49.99' },
        { id: '2', name: 'Hydrating Cream', quantity: 2, price: '$79.99' }
      ]
    }
    // Add more orders as needed
  ]

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-orange-50/80 to-white px-4 py-16"
    >
      <div className="mx-auto max-w-4xl">
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

        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default OrderHistoryPage
