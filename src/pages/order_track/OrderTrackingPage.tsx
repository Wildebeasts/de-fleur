import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  OrderStatusLoader,
  orderTrackingStates
} from '@/components/ui/order-status-loader'
import { Search } from 'lucide-react'

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

const OrderTrackingPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('')
  const [currentStatus] = useState(2) // This would normally come from your backend

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

        <motion.div variants={itemVariants} className="mx-auto mb-12 max-w-md">
          <div className="flex gap-2">
            <Input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Enter order number"
              className="border-rose-200"
            />
            <Button className="bg-[#3A4D39] hover:bg-[#4A5D49]">
              <Search className="size-4" />
            </Button>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-lg border border-rose-200/50 bg-white p-8 shadow-lg"
        >
          <OrderStatusLoader
            currentStatus={currentStatus}
            orderStatuses={orderTrackingStates}
          />

          <motion.div
            variants={itemVariants}
            className="mt-12 rounded-lg bg-orange-50 p-6"
          >
            <h3 className="mb-2 text-lg font-medium text-[#3A4D39]">
              Delivery Details
            </h3>
            <div className="grid gap-4 text-sm text-[#3A4D39]/80">
              <div className="flex justify-between">
                <span>Estimated Delivery:</span>
                <span className="font-medium">March 15, 2024</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Method:</span>
                <span className="font-medium">Express Delivery</span>
              </div>
              <div className="flex justify-between">
                <span>Tracking Number:</span>
                <span className="font-medium">1234567890</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default OrderTrackingPage
