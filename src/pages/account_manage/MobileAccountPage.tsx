import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  User,
  MapPin,
  Settings,
  FileText,
  LogOut,
  ChevronRight,
  Edit2,
  Shield,
  Gift,
  Clock,
  Heart,
  ShoppingCart
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import userApi from '@/lib/services/userService'
import { useAuth } from '@/lib/context/AuthContext'

const MobileAccountPage = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [cartCount, setCartCount] = useState(0)

  // Fetch user information
  const { data: userInfo, isLoading } = useQuery({
    queryKey: ['user-info'],
    queryFn: async () => {
      const response = await userApi.getUserProfile()
      return response
    }
  })

  // Fetch cart count - simulate with a useEffect
  useEffect(() => {
    // In a real app, this would fetch from an API or context
    const fetchCartCount = async () => {
      // This is a placeholder - replace with actual API call
      // const response = await cartApi.getCartCount()
      // setCartCount(response.data.count)

      // For demo, just set a random number
      setCartCount(Math.floor(Math.random() * 5))
    }

    fetchCartCount()
  }, [])

  const handleLogout = async () => {
    try {
      logout()
      toast('Logged out successfully', {
        description: 'You have been logged out of your account.'
      })
      navigate({ to: '/' })
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed', {
        description: 'Please try again later.'
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-[#3A4D39]">My Account</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/cart' })}
              className="relative"
            >
              <ShoppingCart className="size-5 text-[#3A4D39]" />
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#3A4D39] text-xs text-white">
                {cartCount > 0 ? cartCount : '0'}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/settings' })}
            >
              <Settings className="size-5 text-[#3A4D39]" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 overflow-hidden rounded-xl bg-white p-4 shadow-sm"
        >
          {isLoading ? (
            <div className="flex items-center space-x-4">
              <Skeleton className="size-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-16 border-2 border-[#E8F3D6]">
                  <AvatarImage src={userInfo?.avatarUrl} />
                  <AvatarFallback className="bg-[#A7C4BC] text-white">
                    {userInfo?.firstName?.substring(0, 1) || ''}
                    {userInfo?.lastName?.substring(0, 1) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-medium text-[#3A4D39]">
                    {userInfo
                      ? `${userInfo.firstName} ${userInfo.lastName}`
                      : 'User'}
                  </h2>
                  <p className="text-sm text-gray-500">{userInfo?.email}</p>
                  <div className="mt-1">
                    <span className="inline-block rounded-full bg-[#E8F3D6] px-2 py-0.5 text-xs font-medium text-[#3A4D39]">
                      {userInfo?.roles?.[0] || 'Member'}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400"
                onClick={() => navigate({ to: '/edit-profile' })}
              >
                <Edit2 className="size-4" />
              </Button>
            </div>
          )}
        </motion.div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid w-full grid-cols-3 bg-white">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Content based on active tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Skin Type Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="overflow-hidden rounded-xl bg-white shadow-sm"
            >
              <div className="border-b border-gray-100 p-4">
                <h3 className="font-medium text-[#3A4D39]">Your Skin Type</h3>
                <p className="text-xs text-gray-500">
                  Based on your quiz results
                </p>
              </div>
              <div className="p-4">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : userInfo?.skinType ? (
                  <div>
                    <p className="font-medium text-gray-700">
                      {userInfo.skinType.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {userInfo.skinType.description}
                    </p>
                    <Button
                      className="mt-3 w-full bg-[#3A4D39] text-white hover:bg-[#4A5D49]"
                      onClick={() => navigate({ to: '/quiz_result' })}
                    >
                      View Recommendations
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-500">No skin type results found</p>
                    <Button
                      className="mt-3 w-full bg-[#3A4D39] text-white hover:bg-[#4A5D49]"
                      onClick={() => navigate({ to: '/quiz' })}
                    >
                      Take Skin Quiz
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Account menu items */}
            <AccountMenuItem
              icon={<User className="size-5 text-[#3A4D39]" />}
              title="Personal Information"
              description="Manage your personal details"
              onClick={() => navigate({ to: '/personal-info' })}
              delay={0.2}
            />

            <AccountMenuItem
              icon={<MapPin className="size-5 text-[#3A4D39]" />}
              title="Addresses"
              description="Manage your saved addresses"
              onClick={() => navigate({ to: '/addresses' })}
              delay={0.3}
            />

            <AccountMenuItem
              icon={<Shield className="size-5 text-[#3A4D39]" />}
              title="Privacy & Security"
              description="Update password and security settings"
              onClick={() => navigate({ to: '/security' })}
              delay={0.4}
            />

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 w-full rounded-lg border border-red-200 bg-white p-3 text-center text-red-500"
              onClick={handleLogout}
            >
              <span className="flex items-center justify-center gap-2">
                <LogOut className="size-5" /> Sign Out
              </span>
            </motion.button>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <AccountMenuItem
              icon={<Clock className="size-5 text-[#3A4D39]" />}
              title="Order History"
              description="View all your past orders"
              onClick={() => navigate({ to: '/order_history' })}
              delay={0.1}
            />

            <AccountMenuItem
              icon={<FileText className="size-5 text-[#3A4D39]" />}
              title="Returns & Refunds"
              description="Manage return requests"
              onClick={() => navigate({ to: '/returns' })}
              delay={0.2}
            />

            <AccountMenuItem
              icon={<Gift className="size-5 text-[#3A4D39]" />}
              title="My Coupons"
              description="View available and used coupons"
              onClick={() => navigate({ to: '/my_coupons' })}
              delay={0.3}
            />
          </motion.div>
        )}

        {activeTab === 'saved' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <AccountMenuItem
              icon={<Heart className="size-5 text-[#3A4D39]" />}
              title="Wishlist"
              description="Products you've saved"
              onClick={() => navigate({ to: '/wishlist' })}
              delay={0.1}
            />
          </motion.div>
        )}
      </main>
    </div>
  )
}

// Account menu item component
const AccountMenuItem = ({ icon, title, description, onClick, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="overflow-hidden rounded-xl bg-white shadow-sm"
      onClick={onClick}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-[#E8F3D6]/50 p-2">{icon}</div>
          <div>
            <h3 className="font-medium text-gray-800">{title}</h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <ChevronRight className="size-5 text-gray-400" />
      </div>
    </motion.div>
  )
}

export default MobileAccountPage
