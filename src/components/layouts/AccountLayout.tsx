/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

  const handleTabChange = (value: string) => {
    if (value === 'account') {
      navigate({ to: '/account_manage' })
    } else if (value === 'orders') {
      navigate({ to: '/order_history' })
    } else if (value === 'coupons') {
      navigate({ to: '/my_coupons' })
    }
  }

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
            <TabsList className="mb-6 grid w-full grid-cols-3">
              <TabsTrigger value="account">Account Settings</TabsTrigger>
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="coupons">My Coupons</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        <motion.div variants={itemVariants}>{children}</motion.div>
      </div>
    </motion.div>
  )
}

export default AccountLayout
