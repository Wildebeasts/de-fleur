import React from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

const OrderSummary: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col rounded-lg bg-white p-6 text-base text-black shadow-sm"
    >
      <motion.h2
        variants={itemVariants}
        className="py-1.5 text-xl font-semibold"
      >
        Order Summary
      </motion.h2>

      <motion.div variants={itemVariants} className="mt-6 flex w-full flex-col">
        <form className="flex gap-2">
          <Input
            id="promoCode"
            type="text"
            placeholder="Promo Code"
            className="w-fit grow"
          />
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="secondary"
              className="bg-[#D1E2C4] text-white hover:bg-[#D1E2C4]/90"
            >
              Apply
            </Button>
          </motion.div>
        </form>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-6 flex w-full flex-col justify-center rounded-lg bg-orange-50 p-4 text-sm"
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-center gap-2">
          <Checkbox
            id="giftWrap"
            className="border-black data-[state=checked]:border-[#D1E2C4] data-[state=checked]:bg-[#D1E2C4]"
          />
          <label htmlFor="giftWrap" className="leading-none">
            Add Gift Wrapping (+$5.00)
          </label>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-6 flex w-full flex-col whitespace-nowrap leading-none"
      >
        {[
          { label: 'Subtotal', value: '$154.00' },
          { label: 'Shipping', value: '$7.99' },
          { label: 'Tax', value: '$12.32' }
        ].map((item, index) => (
          <motion.div
            key={item.label}
            variants={itemVariants}
            className={`flex justify-between gap-5 ${
              index > 0 ? 'mt-4' : ''
            } py-1.5`}
          >
            <div>{item.label}</div>
            <div className="font-medium">{item.value}</div>
          </motion.div>
        ))}

        <motion.div
          variants={itemVariants}
          className="mt-4 flex w-full flex-col border-t pt-4 font-semibold"
        >
          <div className="flex justify-between gap-5 py-1.5">
            <div>Total</div>
            <div>$174.31</div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          className="mt-6 w-full bg-rose-300 text-white hover:bg-rose-300/90"
          size="lg"
        >
          Proceed to Checkout
        </Button>
      </motion.div>

      <motion.img
        variants={itemVariants}
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/d25f06f59a25e1f26efd330a326a9394d26c17e2e81f39e4f7fc9196b6a7d86c"
        alt="Payment methods"
        className="mt-4 aspect-[15.38] w-[368px] object-contain"
      />
    </motion.div>
  )
}

export default OrderSummary
