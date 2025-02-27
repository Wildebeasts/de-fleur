import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import OrderSummary from '@/components/Cart/OrderSummary'
import CartItem from '@/components/Cart/CartItem'
import NeedHelp from '@/components/Cart/NeedHelp'
import SecurityInfo from '@/components/Cart/SecurityInfo'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/context/CartContext'
import { Link } from '@tanstack/react-router'
import cartApi from '@/lib/services/cartApi'
import { useAuth } from '@/lib/context/AuthContext'

// Define animation variants
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

const ShoppingCartPage: React.FC = () => {
  const { cartItems, getItemCount } = useCart()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchUserCart = async () => {
      if (isAuthenticated) {
        try {
          const response = await cartApi.getCurrentUserCart()
          // The cart data will be automatically handled by CartContext
          console.log('Cart fetched successfully:', response.data)
        } catch (error) {
          console.error('Error fetching cart:', error)
        }
      }
    }

    fetchUserCart()
  }, [isAuthenticated])

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col overflow-hidden rounded-lg border-2 border-solid border-gray-300 bg-white"
    >
      <div className="flex w-full flex-col bg-orange-50 max-md:max-w-full">
        <motion.div
          variants={itemVariants}
          className="-mt-4 flex w-full max-w-screen-xl flex-col justify-center self-center px-3.5 py-8 max-md:max-w-full"
        >
          <div className="flex gap-5 max-md:flex-col">
            <motion.div
              variants={itemVariants}
              className="flex w-[66%] flex-col max-md:ml-0 max-md:w-full"
            >
              <div className="flex w-full grow flex-col px-0.5 pb-28 pt-px max-md:mt-7 max-md:max-w-full max-md:pb-24">
                <div className="flex w-full flex-col rounded-lg bg-white p-6 shadow-sm max-md:max-w-full max-md:px-5">
                  <div className="flex flex-wrap justify-between gap-5 py-1 max-md:max-w-full">
                    <motion.h1
                      variants={itemVariants}
                      className="text-2xl font-semibold leading-none text-black"
                    >
                      Shopping Cart ({getItemCount()})
                    </motion.h1>
                    <Link to="/collections">
                      <Button variant="ghost" className="hover:bg-[#D1E2C4]/20">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>

                  <motion.div
                    variants={itemVariants}
                    className="mt-6 flex flex-col rounded-lg bg-[#D1E2C4]/20 px-4 pb-8 pt-4"
                  >
                    <div className="flex flex-col py-0.5">
                      <div className="text-xs font-semibold leading-none text-black">
                        $24 away from Free Shipping
                      </div>
                      <div className="mt-2 overflow-hidden rounded bg-[#D1E2C4]/30">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '75%' }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-2 bg-[#D1E2C4]"
                        />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="mt-6 flex w-full flex-col gap-4"
                  >
                    {cartItems.length > 0 ? (
                      cartItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: index * 0.1 }}
                        >
                          <CartItem item={item} />
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        Your cart is empty
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="ml-5 flex w-[34%] flex-col max-md:ml-0 max-md:w-full"
            >
              <div className="flex w-full grow flex-col p-0.5 max-md:mt-7">
                <OrderSummary />
                <NeedHelp />
              </div>
            </motion.div>
          </div>
        </motion.div>
        <SecurityInfo />
      </div>
    </motion.div>
  )
}

export default ShoppingCartPage
