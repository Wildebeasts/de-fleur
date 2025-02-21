import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const SalesCustomerInsightsPage: React.FC = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-orange-50/80 to-white px-4 py-16"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div variants={itemVariants} className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-semibold text-[#3A4D39]">
            Sales & Customer Insights
          </h1>
          <p className="text-lg text-[#3A4D39]/80">
            Analyze customer behavior and product performance metrics
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex gap-4">
            <Select defaultValue="7days">
              <SelectTrigger className="w-[180px] border-[#D1E2C4]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid gap-6 md:grid-cols-2"
        >
          <Card className="border-[#D1E2C4]">
            <CardHeader>
              <CardTitle className="text-[#3A4D39]">
                Customer Behavior
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-[#D1E2C4]/10 p-4">
                  <h3 className="mb-2 font-medium text-[#3A4D39]">
                    Purchase Frequency
                  </h3>
                  <p className="text-[#3A4D39]/80">
                    Average 2.5 orders per customer
                  </p>
                </div>
                <div className="rounded-lg bg-[#D1E2C4]/10 p-4">
                  <h3 className="mb-2 font-medium text-[#3A4D39]">
                    Customer Retention
                  </h3>
                  <p className="text-[#3A4D39]/80">
                    75% return rate within 30 days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#D1E2C4]">
            <CardHeader>
              <CardTitle className="text-[#3A4D39]">
                Product Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-[#D1E2C4]/10 p-4">
                  <h3 className="mb-2 font-medium text-[#3A4D39]">
                    Top Products
                  </h3>
                  <p className="text-[#3A4D39]/80">
                    1. Product A (250 units)
                    <br />
                    2. Product B (180 units)
                  </p>
                </div>
                <div className="rounded-lg bg-[#D1E2C4]/10 p-4">
                  <h3 className="mb-2 font-medium text-[#3A4D39]">
                    Revenue Growth
                  </h3>
                  <p className="text-[#3A4D39]/80">
                    15% increase from last period
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default SalesCustomerInsightsPage
