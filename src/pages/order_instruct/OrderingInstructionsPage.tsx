import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

// Animation variants from ShopSearchPage.tsx (lines 9-23)
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

const orderingSteps = [
  {
    title: 'Browse Products',
    description: 'Explore our collection of natural skincare products',
    details: [
      'Use filters to narrow down products by category',
      'Read detailed product descriptions',
      'Check ingredient lists and benefits'
    ]
  },
  {
    title: 'Add to Cart',
    description: 'Select your desired products and quantities',
    details: [
      'Choose product variants if available',
      'Review your selection',
      'Check stock availability'
    ]
  },
  {
    title: 'Checkout Process',
    description: 'Complete your purchase securely',
    details: [
      'Enter shipping information',
      'Choose payment method',
      'Review order summary'
    ]
  }
]

const shippingInfo = {
  domestic: {
    standard: '3-5 business days',
    express: '1-2 business days'
  },
  international: {
    standard: '10-15 business days',
    express: '5-7 business days'
  }
}

const OrderingInstructionsPage: React.FC = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-orange-50/80 to-white px-4 py-16"
    >
      <div className="mx-auto max-w-7xl">
        <motion.section variants={itemVariants} className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-rose-100 px-4 py-2 text-sm text-rose-500">
            How to Order
          </span>
          <h1 className="mb-4 text-4xl font-semibold text-[#3A4D39]">
            Ordering Instructions
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#3A4D39]/80">
            Follow these simple steps to place your order and get your natural
            skincare products delivered to your doorstep.
          </p>
        </motion.section>

        <motion.div variants={itemVariants} className="space-y-8">
          {/* Ordering Steps */}
          <div className="grid gap-6 md:grid-cols-3">
            {orderingSteps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="rounded-lg border border-[#D1E2C4] bg-white p-6"
              >
                <span className="mb-4 inline-block rounded-full bg-[#D1E2C4]/30 px-3 py-1 text-sm text-[#3A4D39]">
                  Step {index + 1}
                </span>
                <h3 className="mb-2 text-xl font-semibold text-[#3A4D39]">
                  {step.title}
                </h3>
                <p className="mb-4 text-[#3A4D39]/80">{step.description}</p>
                <ul className="space-y-2">
                  {step.details.map((detail, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-[#3A4D39]/70"
                    >
                      <ArrowRight className="size-4 text-[#3A4D39]/40" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Shipping Information */}
          <div className="rounded-lg border border-[#D1E2C4] bg-white p-6">
            <h2 className="mb-6 text-2xl font-semibold text-[#3A4D39]">
              Shipping Information
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-4 text-lg font-medium text-[#3A4D39]">
                  Domestic Shipping
                </h3>
                <div className="space-y-3">
                  <div className="rounded-lg bg-[#D1E2C4]/20 p-4">
                    <p className="font-medium text-[#3A4D39]">
                      Standard Delivery
                    </p>
                    <p className="text-[#3A4D39]/70">
                      {shippingInfo.domestic.standard}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#D1E2C4]/20 p-4">
                    <p className="font-medium text-[#3A4D39]">
                      Express Delivery
                    </p>
                    <p className="text-[#3A4D39]/70">
                      {shippingInfo.domestic.express}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-4 text-lg font-medium text-[#3A4D39]">
                  International Shipping
                </h3>
                <div className="space-y-3">
                  <div className="rounded-lg bg-[#D1E2C4]/20 p-4">
                    <p className="font-medium text-[#3A4D39]">
                      Standard Delivery
                    </p>
                    <p className="text-[#3A4D39]/70">
                      {shippingInfo.international.standard}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#D1E2C4]/20 p-4">
                    <p className="font-medium text-[#3A4D39]">
                      Express Delivery
                    </p>
                    <p className="text-[#3A4D39]/70">
                      {shippingInfo.international.express}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Need Help Section */}
          <motion.section
            variants={itemVariants}
            className="mt-16 overflow-hidden rounded-2xl bg-[#D1E2C4]/30 p-8 text-center"
          >
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.2, scale: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="absolute right-0 top-0 size-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#3A4D39] blur-3xl"
              />
              <h2 className="relative mb-4 text-2xl font-semibold text-[#3A4D39]">
                Need Help with Your Order?
              </h2>
              <p className="relative mb-6 text-[#3A4D39]/80">
                Our customer support team is here to assist you with any
                questions about ordering.
              </p>
              <Button className="relative rounded-full bg-[#3A4D39] px-8 py-3 font-medium text-white transition-all duration-300 hover:bg-[#4A5D49]">
                <span className="flex items-center gap-2">
                  Contact Support
                  <ArrowRight className="size-4" />
                </span>
              </Button>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default OrderingInstructionsPage
