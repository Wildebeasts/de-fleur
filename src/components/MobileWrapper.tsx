import React, { useState, useEffect } from 'react'
import { useIsMobile } from '../hooks/use-mobile'
import { motion } from 'framer-motion'
import {
  Home,
  ShoppingBag,
  Heart,
  User,
  Sparkles,
  ShoppingCart
} from 'lucide-react'
import { useNavigate, useLocation, useMatches } from '@tanstack/react-router'
import Header from './Header'
import FooterWrapper from './index'
import cartApi from '@/lib/services/cartApi'

interface MobileWrapperProps {
  children: React.ReactNode
}

export default function MobileWrapper({ children }: MobileWrapperProps) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { pathname: currentPath } = useLocation()
  const matches = useMatches()
  const isAdminRoute = matches.some((match) =>
    match.pathname.startsWith('/admin')
  )
  const [cartCount, setCartCount] = useState(0)

  // Fetch cart count
  useEffect(() => {
    const fetchCartCount = async () => {
      // Check if user is authenticated before fetching cart
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')

      // Skip cart fetching if user is not authenticated
      if (!accessToken && !refreshToken) {
        setCartCount(0)
        return
      }

      try {
        const response = await cartApi.getCurrentCart()
        if (response.data.isSuccess && response.data.data) {
          // Calculate total items in cart
          const totalItems = response.data.data.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          )
          setCartCount(totalItems)
        }
      } catch (error) {
        console.error('Error fetching cart:', error)
        setCartCount(0)
      }
    }

    // Initial fetch
    fetchCartCount()

    // Set up interval to refetch cart data every 30 seconds
    const intervalId = setInterval(fetchCartCount, 30000)

    // Listen for cart update events
    const handleCartUpdate = () => {
      fetchCartCount()
    }

    window.addEventListener('cart-updated', handleCartUpdate)

    // Clean up on component unmount
    return () => {
      clearInterval(intervalId)
      window.removeEventListener('cart-updated', handleCartUpdate)
    }
  }, [])

  // For web version, render with standard header and footer
  if (!isMobile) {
    return (
      <>
        {!isAdminRoute && <Header />}
        <main>{children}</main>
        {!isAdminRoute && <FooterWrapper />}
      </>
    )
  }

  return (
    <div className="relative">
      <div className="pb-16">{children}</div>

      {/* Floating Cart Button */}
      {!isAdminRoute &&
        !currentPath.includes('/quiz') &&
        !currentPath.includes('/unity_game') && (
          <motion.div
            className="fixed bottom-20 right-4 z-50"
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate({ to: '/cart' })}
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-[#3A4D39] shadow-lg">
              <ShoppingCart className="size-6 text-white" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#3A4D39] shadow-sm">
                  {cartCount}
                </span>
              )}
            </div>
          </motion.div>
        )}

      {/* Bottom Navigation */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t bg-white px-2">
        {/* Home Tab */}
        <NavButton
          icon={<Home className="size-5" />}
          label="Home"
          to="/"
          isActive={currentPath === '/'}
          navigate={navigate}
        />

        {/* Shop Tab */}
        <NavButton
          icon={<ShoppingBag className="size-5" />}
          label="Shop"
          to="/shop"
          isActive={currentPath.includes('/shop')}
          navigate={navigate}
        />

        {/* Results Tab - Special Treatment */}
        <div className="-mt-6 flex flex-col items-center">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="flex size-14 items-center justify-center rounded-full bg-[#3A4D39] shadow-lg"
            onClick={() => navigate({ to: '/quiz_result' })}
          >
            <Sparkles className="size-6 text-white" />
          </motion.div>
          <span
            className={`mt-1 text-xs font-medium ${currentPath.includes('/quiz_result') ? 'text-[#3A4D39]' : 'text-gray-500'}`}
          >
            Results
          </span>
        </div>

        {/* Unity Game Tab (formerly Wishlist) */}
        <NavButton
          icon={<Heart className="size-5" />}
          label="Game"
          to="/unity_game"
          isActive={currentPath.includes('/unity_game')}
          navigate={navigate}
        />

        {/* Account Tab */}
        <NavButton
          icon={<User className="size-5" />}
          label="Account"
          to="/account_manage"
          isActive={currentPath.includes('/account_manage')}
          navigate={navigate}
        />
      </div>
    </div>
  )
}

// Define the NavButton component properly
interface NavButtonProps {
  icon: React.ReactNode
  label: string
  to: string
  isActive: boolean
  navigate: ReturnType<typeof useNavigate>
}

const NavButton = ({ icon, label, to, isActive, navigate }: NavButtonProps) => (
  <button
    className="flex flex-col items-center"
    onClick={() => navigate({ to })}
  >
    <div className={`${isActive ? 'text-[#3A4D39]' : 'text-gray-500'}`}>
      {icon}
    </div>
    <span
      className={`mt-1 text-xs font-medium ${isActive ? 'text-[#3A4D39]' : 'text-gray-500'}`}
    >
      {label}
    </span>
  </button>
)
