/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import userApi from '@/lib/services/userService'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/context/AuthContext'
import AccountLayout from '@/components/layouts/AccountLayout'
import { UserProfile } from '@/lib/types/user'
import { useIsMobile } from '@/hooks/use-mobile'
import { Skeleton } from '@/components/ui/skeleton'
import {
  User,
  Mail,
  Phone,
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
import { toast } from 'sonner'

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

// Mobile version account menu item component
interface AccountMenuItemProps {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
  delay?: number
}

const AccountMenuItem = ({
  icon,
  title,
  description,
  onClick,
  delay = 0
}: AccountMenuItemProps) => {
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

const AccountManagementPage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserProfile>()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(true)
  const [cartCount, setCartCount] = useState(0)

  // Check if user has admin privileges
  const isAdmin = userInfo?.roles?.some(
    (role) => role === 'Admin' || role === 'Administrator' || role === 'Manager'
  )

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        const profile = await userApi.getUserProfile()
        setUserInfo(profile)
      } catch (error) {
        console.error('Failed to fetch user profile', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  // Fetch cart count - simulate with a useEffect
  useEffect(() => {
    // In a real app, this would fetch from an API or context
    const fetchCartCount = async () => {
      // Mock cart count for demo
      setCartCount(Math.floor(Math.random() * 5))
    }

    fetchCartCount()
  }, [])

  const handleLogout = () => {
    logout()
    navigate({ to: '/' })
    toast('Successfully logged out')
  }

  const navigateToAdmin = () => {
    navigate({ to: '/admin' })
  }

  // Render mobile version when on small screens
  if (isMobile) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-[#3A4D39]">My Account</h1>
            {isAdmin && (
              <Button variant="ghost" size="icon" onClick={navigateToAdmin}>
                <Settings className="size-5 text-purple-600" />
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 pb-20">
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
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="bg-[#A7C4BC] text-white">
                      {userInfo?.firstName?.charAt(0)}
                      {userInfo?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-medium text-[#3A4D39]">
                      {userInfo?.firstName} {userInfo?.lastName}
                    </h2>
                    <p className="text-sm text-gray-500">{userInfo?.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400"
                  onClick={() => setActiveTab('personalInfo')}
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
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
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
                      <p className="text-gray-500">
                        No skin type results found
                      </p>
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
                onClick={() => setActiveTab('personalInfo')}
                delay={0.2}
              />

              <AccountMenuItem
                icon={<Shield className="size-5 text-[#3A4D39]" />}
                title="Privacy & Security"
                description="Update password and security settings"
                onClick={() => setActiveTab('security')}
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
                icon={<Gift className="size-5 text-[#3A4D39]" />}
                title="My Coupons"
                description="View all your coupons"
                onClick={() => navigate({ to: '/my_coupons' })}
                delay={0.1}
              />
            </motion.div>
          )}

          {activeTab === 'preferences' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      Email Notifications
                    </h3>
                    <p className="text-xs text-gray-500">
                      Receive updates about new products
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      Marketing Preferences
                    </h3>
                    <p className="text-xs text-gray-500">
                      Receive promotional emails
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Button className="w-full bg-[#3A4D39] text-white hover:bg-[#4A5D49]">
                Save Preferences
              </Button>
            </motion.div>
          )}

          {activeTab === 'personalInfo' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <h3 className="mb-4 font-medium text-[#3A4D39]">
                  Personal Details
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      defaultValue={userInfo?.firstName || ''}
                      className="border-[#E8F3D6]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      defaultValue={userInfo?.lastName || ''}
                      className="border-[#E8F3D6]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={userInfo?.email || ''}
                      className="border-[#E8F3D6]"
                    />
                  </div>

                  <Button className="w-full bg-[#3A4D39] text-white hover:bg-[#4A5D49]">
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <h3 className="mb-4 font-medium text-[#3A4D39]">
                  Update Password
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      className="border-[#E8F3D6]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      className="border-[#E8F3D6]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="border-[#E8F3D6]"
                    />
                  </div>

                  <Button className="w-full bg-[#3A4D39] text-white hover:bg-[#4A5D49]">
                    Update Password
                  </Button>
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-xs text-gray-500">
                      Add extra security to your account
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    )
  }

  // Original desktop version
  return (
    <AccountLayout activeTab="account">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-rose-200/50 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="size-20">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>
                      {userInfo?.firstName?.charAt(0)}
                      {userInfo?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" className="border-rose-200">
                    Change Photo
                  </Button>
                </div>
                <div className="flex gap-2">
                  {isAdmin && (
                    <Button
                      className="bg-purple-600 text-white hover:bg-purple-700"
                      onClick={navigateToAdmin}
                    >
                      Admin Dashboard
                    </Button>
                  )}
                  <Button
                    className="bg-red-500 text-white hover:bg-red-600"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    className="border-rose-200"
                    disabled
                    defaultValue={userInfo?.firstName}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    className="border-rose-200"
                    disabled
                    defaultValue={userInfo?.lastName}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  className="border-rose-200"
                  disabled
                  defaultValue={userInfo?.email}
                />
              </div>
            </CardContent>
          </Card>

          {/* Skin Type Section */}
          <Card className="mt-6 border-rose-200/50 shadow-lg">
            <CardHeader>
              <CardTitle>Your Skin Type</CardTitle>
              <CardDescription>
                This is based on your latest quiz results.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userInfo?.skinType ? (
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    {userInfo.skinType.name}
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    {userInfo.skinType.description}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No skin type found.</p>
              )}
              <Button
                className="w-full bg-orange-500 text-white hover:bg-orange-600"
                onClick={() => navigate({ to: '/quiz_result' })}
              >
                View Quiz Results
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border-rose-200/50 shadow-lg">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" className="border-rose-200" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" className="border-rose-200" />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" className="border-rose-200" />
              </div>
              <Button className="w-full bg-orange-500 text-white hover:bg-orange-600">
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="border-rose-200/50 shadow-lg">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-500">
                    Receive updates about new products
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">Marketing Preferences</h4>
                  <p className="text-sm text-gray-500">
                    Receive promotional emails
                  </p>
                </div>
                <Switch />
              </div>
              <Button className="w-full bg-orange-500 text-white hover:bg-orange-600">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AccountLayout>
  )
}

export default AccountManagementPage
