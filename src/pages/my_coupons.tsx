/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import AccountLayout from '@/components/layouts/AccountLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Coins, Gift, ShoppingBag, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import couponApi from '@/lib/services/couponApi'
import userApi from '@/lib/services/userService'
import { CouponResponse } from '@/lib/types/Coupon'

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function MyCoupons() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('available')

  // Fetch user profile to get points
  const { data: userProfile, isLoading: userLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => userApi.getUserProfile()
  })

  // Fetch available coupons
  const { data: couponsData, isLoading: couponsLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => couponApi.getAll(),
    select: (data) => {
      // Filter coupons that are still valid
      const now = new Date()
      return (
        data.data.data?.filter(
          (coupon: { expiryDate: string | number | Date }) =>
            new Date(coupon.expiryDate) > now
        ) || []
      )
    }
  })

  // Exchange coupon mutation
  const exchangeCouponMutation = useMutation({
    mutationFn: (couponId: string) => couponApi.exchangeCoupon({ couponId }),
    onSuccess: (response) => {
      if (response.data.isSuccess) {
        toast.success('Coupon exchanged successfully!')
        queryClient.invalidateQueries({ queryKey: ['user-profile'] })
        queryClient.invalidateQueries({ queryKey: ['user-coupons'] })
      } else {
        toast.error(response.data.message || 'Failed to exchange coupon')
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to exchange coupon')
    }
  })

  // Handle coupon exchange
  const handleExchangeCoupon = (coupon: CouponResponse) => {
    if (!userProfile) {
      toast.error('Please log in to exchange coupons')
      return
    }

    if (userProfile.point < (coupon.pointRequired || 0)) {
      toast.error(
        `You need ${coupon.pointRequired || 0} points to exchange this coupon`
      )
      return
    }

    exchangeCouponMutation.mutate(coupon.id)
  }

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Fetch user coupons
  const { data: userCouponsData, isLoading: userCouponsLoading } = useQuery({
    queryKey: ['user-coupons'],
    queryFn: () => {
      return userApi.getUserCoupons().then(response => {
        console.log('User Coupons Response:', response);
        return response;
      });
    },
    enabled: !!userProfile
  })

  return (
    <AccountLayout activeTab="coupons">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={itemVariants}
        className="space-y-6"
      >
        {/* Points Display */}
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-amber-800">
                  Your Points
                </h3>
                <p className="text-sm text-amber-600">
                  Use your points to exchange for coupons
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                <Coins className="size-5 text-amber-500" />
                <span className="text-xl font-bold text-amber-700">
                  {userLoading ? (
                    <Skeleton className="h-6 w-12" />
                  ) : (
                    userProfile?.point || 0
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coupons Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>My Coupons</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 grid w-full grid-cols-2">
                <TabsTrigger value="available">Available Coupons</TabsTrigger>
                <TabsTrigger value="my-coupons">My Coupons</TabsTrigger>
              </TabsList>

              <TabsContent value="available">
                {couponsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-4 rounded-lg border p-4"
                      >
                        <Skeleton className="size-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !couponsData?.length ? (
                  <div className="py-8 text-center">
                    <Gift className="mx-auto size-12 text-gray-300" />
                    <p className="mt-2 text-gray-500">
                      No coupons available for exchange
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {couponsData?.map((coupon: CouponResponse) => {
                      console.log(
                        'Coupon:',
                        coupon.name,
                        'PointRequired:',
                        coupon.pointRequired
                      )
                      return (
                        <Card
                          key={coupon.id}
                          className="overflow-hidden border-gray-200"
                        >
                          <div className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-emerald-800">
                                {coupon.name}
                              </h3>
                              <Badge variant="outline" className="bg-white">
                                {coupon.discount}% OFF
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              Code:{' '}
                              <span className="font-mono font-medium">
                                {coupon.code}
                              </span>
                            </p>
                          </div>
                          <div className="p-4">
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="mr-1 size-4" />
                                Expires: {formatDate(coupon.expiryDate)}
                              </div>
                              <div className="flex items-center text-sm font-medium text-amber-600">
                                <Coins className="mr-1 size-4" />
                                {coupon.pointRequired} points
                              </div>
                            </div>
                            {coupon.minimumOrderPrice > 0 && (
                              <p className="mb-3 text-xs text-gray-500">
                                Min. Order: ${coupon.minimumOrderPrice}
                              </p>
                            )}
                            <Button
                              className="mt-2 w-full"
                              variant={
                                (userProfile?.point || 0) >=
                                  (coupon.pointRequired || 0)
                                  ? 'default'
                                  : 'outline'
                              }
                              disabled={
                                !userProfile ||
                                (userProfile.point || 0) <
                                (coupon.pointRequired || 0) ||
                                exchangeCouponMutation.isPending
                              }
                              onClick={() => handleExchangeCoupon(coupon)}
                            >
                              {exchangeCouponMutation.isPending
                                ? 'Exchanging...'
                                : 'Exchange Coupon'}
                            </Button>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="my-coupons">
                {userCouponsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-4 rounded-lg border p-4"
                      >
                        <Skeleton className="size-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !userCouponsData || userCouponsData.length === 0 ? (
                  <div className="py-8 text-center">
                    <ShoppingBag className="mx-auto size-12 text-gray-300" />
                    <p className="mt-2 text-gray-500">
                      You don&apos;t have any coupons yet
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setActiveTab('available')}
                    >
                      Exchange Coupons
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {userCouponsData.map((userCoupon) => (
                      <Card
                        key={userCoupon.couponId}
                        className="overflow-hidden border-gray-200"
                      >
                        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-indigo-800">
                              {userCoupon.coupon.name}
                            </h3>
                            <Badge variant="outline" className="bg-white">
                              {userCoupon.coupon.discount}% OFF
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Code:{' '}
                            <span className="font-mono font-medium">
                              {userCoupon.coupon.code}
                            </span>
                          </p>
                        </div>
                        <div className="p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="mr-1 size-4" />
                              Expires:{' '}
                              {formatDate(userCoupon.coupon.expiryDate)}
                            </div>
                            <Badge variant="secondary">
                              Quantity: {userCoupon.quantity}
                            </Badge>
                          </div>
                          {userCoupon.coupon.minimumOrderPrice > 0 && (
                            <p className="mb-3 text-xs text-gray-500">
                              Min. Order: ${userCoupon.coupon.minimumOrderPrice}
                            </p>
                          )}
                          <Button
                            className="mt-2 w-full"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                userCoupon.coupon.code
                              )
                              toast.success('Coupon code copied to clipboard!')
                            }}
                          >
                            Copy Code
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </AccountLayout>
  )
}
