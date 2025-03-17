/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/context/AuthContext'
import userApi, { UserProfile } from '@/lib/services/userService'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

interface AccountLayoutProps {
  children: React.ReactNode
  activeTab: string
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  children,
  activeTab
}) => {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const [userInfo, setUserInfo] = useState<UserProfile>()

  const handleTabChange = (value: string) => {
    if (value === 'account') {
      navigate({ to: '/account_manage' })
    } else if (value === 'orders') {
      navigate({ to: '/order_history' })
    }
  }

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await userApi.getUserProfile()
        setUserInfo(profile)
      } catch (error) {
        console.error('Failed to fetch user profile', error)
      }
    }

    fetchUserProfile()
  }, [])

  // Check if the user is a staff member
  const isStaff = userInfo?.roles?.includes('Staff')

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-orange-50/80 to-white px-4 py-16"
    >
      <div className="mx-auto max-w-4xl">
        <motion.section variants={itemVariants} className="mb-8 text-center">
          <span className="mb-4 inline-block rounded-full bg-rose-100 px-4 py-2 text-sm text-rose-500">
            My Account
          </span>
          <h1 className="mb-4 text-4xl font-semibold text-[#3A4D39]">
            Manage Your Account
          </h1>
        </motion.section>

        <motion.div variants={itemVariants} className="mb-8">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList
              className={`mb-6 grid w-full ${
                isStaff ? 'grid-cols-3' : 'grid-cols-2'
              }`}
            >
              <TabsTrigger value="account">Account Settings</TabsTrigger>
              <TabsTrigger value="orders">Order History</TabsTrigger>
              {isStaff && (
                <TabsTrigger
                  value="staff"
                  onClick={() => navigate({ to: '/staff' })}
                >
                  Staff
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </motion.div>

        <motion.div variants={itemVariants}>{children}</motion.div>
      </div>
    </motion.div>
  )
}

export default AccountLayout
