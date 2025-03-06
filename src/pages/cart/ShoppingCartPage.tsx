/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import OrderSummary from '@/components/Cart/OrderSummary'
import CartItem from '@/components/Cart/CartItem'
import NeedHelp from '@/components/Cart/NeedHelp'
import SecurityInfo from '@/components/Cart/SecurityInfo'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from '@tanstack/react-router'
import cartApi from '@/lib/services/cartApi'
import { toast } from 'sonner'
import { CartItem as ApiCartItem } from '@/lib/types/Cart'

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

// Define your local CartItem type
interface CartItem {
  cosmeticId: string
  cosmeticName: string
  cosmeticImage: string
  price: number
  quantity: number
  subtotal: number
  weight: number
  length: number
  width: number
  height: number
}

const ShoppingCartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartId, setCartId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const navigate = useNavigate()

  // Fetch cart data directly from API
  const fetchCart = async () => {
    try {
      setIsLoading(true)
      const response = await cartApi.getCurrentCart()
      if (response.data.isSuccess) {
        // Map API response to your component's CartItem type
        const items =
          response.data.data?.items?.map((item: ApiCartItem) => ({
            cosmeticId: item.cosmeticId,
            cosmeticName: item.cosmeticName,
            cosmeticImage: item.cosmeticImage || '',
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
            weight: item.weight || 0,
            length: item.length || 0,
            width: item.width || 0,
            height: item.height || 0
          })) || []

        setCartItems(items)
        setCartId(response.data.data?.id || null)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      toast.error('Không thể tải giỏ hàng')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  // Update item quantity
  const updateItemQuantity = async (cosmeticId: string, quantity: number) => {
    try {
      setIsUpdating(true)

      // Optimistically update UI
      const updatedItems = cartItems.map((item) =>
        item.cosmeticId === cosmeticId ? { ...item, quantity } : item
      )
      setCartItems(updatedItems)

      // Send API request using your existing cart API
      await cartApi.updateCart({
        cartId: cartId || '',
        items: [{ cosmeticId, quantity }]
      })

      // Refetch to confirm update
      fetchCart()
    } catch (error) {
      console.error('Error updating cart:', error)
      toast.error('Không thể cập nhật giỏ hàng')
      // Revert to original state on error
      fetchCart()
    } finally {
      setIsUpdating(false)
    }
  }

  // Remove item
  const removeItem = async (cosmeticId: string) => {
    try {
      setIsUpdating(true)

      // Optimistically update UI
      const updatedItems = cartItems.filter(
        (item) => item.cosmeticId !== cosmeticId
      )
      setCartItems(updatedItems)

      // Send API request
      await cartApi.removeFromCart(cartId || '', cosmeticId)

      // Success message
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Không thể xóa sản phẩm')
      // Revert to original state on error
      fetchCart()
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCheckout = () => {
    navigate({ to: '/checkout' })
  }

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  }

  // Render loading state
  if (isLoading) {
    return <div className="container mx-auto p-4">Loading cart...</div>
  }

  // Render empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="mb-4 text-2xl font-semibold">Your cart is empty</h2>
        <button
          className="rounded-full bg-[#3A4D39] px-6 py-2 text-white"
          onClick={() => navigate({ to: '/shop' })}
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  // Render cart with items
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
                      Shopping Cart ({cartItems.length})
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
                    {cartItems.map((item, index) => (
                      <motion.div
                        key={item.cosmeticId}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.1 }}
                      >
                        <CartItem
                          item={item}
                          updateQuantity={updateItemQuantity}
                          removeItem={removeItem}
                        />
                      </motion.div>
                    ))}
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
