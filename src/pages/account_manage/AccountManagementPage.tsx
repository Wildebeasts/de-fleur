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
import userApi, { UserProfile } from '@/lib/services/userService'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/context/AuthContext'

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

const AccountManagementPage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserProfile>()
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await userApi.getUserProfile()
        console.log(profile)

        setUserInfo(profile)
      } catch (error) {
        console.error('Failed to fetch user profile', error)
      }
    }

    fetchUserProfile()
  }, [])

  const handleLogout = () => {
    logout()
    navigate({ to: '/' }) // Redirect to login page after logout
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-orange-50/80 to-white px-4 py-16"
    >
      <div className="mx-auto max-w-4xl">
        <motion.section variants={itemVariants} className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-rose-100 px-4 py-2 text-sm text-rose-500">
            Account Settings
          </span>
          <h1 className="mb-4 text-4xl font-semibold text-[#3A4D39]">
            Manage Your Account
          </h1>
        </motion.section>

        <motion.div variants={itemVariants}>
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
                    <Button
                      className="bg-red-500 text-white hover:bg-red-600"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
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
                        {userInfo.skinType.name}{' '}
                        {/* Assuming user.skinType has a name field */}
                      </p>
                      <p className="text-sm font-medium text-gray-700">
                        {userInfo.skinType.description}{' '}
                        {/* Assuming user.skinType has a name field */}
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
                  <CardDescription>
                    Manage your account security
                  </CardDescription>
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default AccountManagementPage
