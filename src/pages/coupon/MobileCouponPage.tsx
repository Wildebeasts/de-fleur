import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { format, isAfter, isBefore, parseISO } from 'date-fns'
import {
  ArrowLeft,
  Loader2,
  Ticket,
  Clock,
  Copy,
  CheckCircle,
  Search,
  X,
  Info
} from 'lucide-react'
import { toast } from 'sonner'
import couponApi from '@/lib/services/couponApi'
import userApi from '@/lib/services/userService'
import { CouponResponse } from '@/lib/types/Coupon'
import { AxiosError } from 'axios'

// Define an interface for the Coupon that extends CouponResponse with additional properties
interface Coupon extends CouponResponse {
  isActive: boolean
  description: string
  discountType: 'percentage' | 'fixed'
  minOrderValue: number
  categories?: string[]
  isNew?: boolean
  endDate: string
}

// Format currency to VND
const formatToVND = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

// Animation variants
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
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

const MobileCouponPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'expiring'>('all')
  const [activeTab, setActiveTab] = useState<'my-coupons' | 'available'>(
    'my-coupons'
  )

  // Fetch user profile to get points
  const { data: userProfile, isLoading: userLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => userApi.getUserProfile()
  })

  // Fetch available coupons for exchange
  const { data: availableCoupons, isLoading: availableCouponsLoading } =
    useQuery({
      queryKey: ['available-coupons'],
      queryFn: () => couponApi.getAll(),
      select: (data) => {
        // Filter coupons that are still valid
        const now = new Date()
        return (
          data.data.data?.filter(
            (coupon: { expiryDate: string }) =>
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
        queryClient.invalidateQueries({ queryKey: ['coupons'] })
      } else {
        toast.error(response.data.message || 'Failed to exchange coupon')
      }
    },
    onError: (error: AxiosError<{ message: string }>) => {
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

  // Fetch coupon data
  const {
    data: couponsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      try {
        const response = await userApi.getUserCoupons()
        console.log('API Response:', response)

        // Process user coupons to extract and transform the coupon data
        if (Array.isArray(response)) {
          return response.map((userCoupon) => {
            const couponData = userCoupon.coupon
            // Transform CouponResponse to Coupon with additional properties
            return {
              ...couponData,
              isActive: true, // Assume active by default
              description: couponData.name || '', // Use name as description if needed
              discountType: 'percentage', // Assume percentage discount
              minOrderValue: couponData.minimumOrderPrice,
              endDate: couponData.expiryDate,
              isNew: false
            } as Coupon
          })
        }

        return []
      } catch (error) {
        console.error('Error fetching coupons:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  // Helper to check if a coupon is expiring soon (within 7 days)
  const isExpiringSoon = (endDate: string) => {
    const today = new Date()
    const expiryDate = parseISO(endDate)
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(today.getDate() + 7)

    return isAfter(expiryDate, today) && isBefore(expiryDate, sevenDaysFromNow)
  }

  // Helper to check if a coupon is valid
  const isCouponValid = (coupon: Coupon) => {
    const today = new Date()
    return (
      coupon.isActive &&
      isAfter(today, parseISO(coupon.startDate)) &&
      isBefore(today, parseISO(coupon.endDate))
    )
  }

  // Filter and search coupons
  const filteredCoupons = React.useMemo(() => {
    // Ensure couponsData is an array before filtering
    if (!couponsData || !Array.isArray(couponsData)) return []

    return couponsData.filter((coupon: Coupon) => {
      // Apply search filter
      const matchesSearch = searchQuery
        ? coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coupon.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true

      // Apply category filter
      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'active'
            ? isCouponValid(coupon)
            : isExpiringSoon(coupon.endDate)

      return matchesSearch && matchesFilter
    })
  }, [couponsData, searchQuery, filter])

  // Copy coupon code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(
      () => {
        setCopiedCode(code)
        toast.success('Coupon code copied to clipboard')
        setTimeout(() => setCopiedCode(null), 3000)
      },
      () => {
        toast.error('Failed to copy code')
      }
    )
  }

  // Handle coupon selection for detail view
  const handleCouponSelect = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
  }

  // Clear selected coupon
  const handleClose = () => {
    setSelectedCoupon(null)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9f9]">
        <div className="flex flex-col items-center">
          <Loader2 className="mb-4 size-10 animate-spin text-[#3A4D39]" />
          <p className="text-[#3A4D39]">Loading coupons...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    toast.error('Failed to load coupons')
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f9f9f9] px-4">
        <div className="mb-6 rounded-full bg-red-100 p-4">
          <Ticket className="size-10 text-red-500" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-[#3A4D39]">
          Error Loading Coupons
        </h2>
        <p className="mb-6 text-center text-[#3A4D39]/70">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <button
          className="rounded-full bg-[#3A4D39] px-6 py-3 text-white"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    )
  }

  // Coupon detail view
  if (selectedCoupon) {
    const valid = isCouponValid(selectedCoupon)
    const expiringSoon = isExpiringSoon(selectedCoupon.endDate)

    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="mr-3 rounded-full p-2 active:bg-gray-100"
                onClick={handleClose}
              >
                <ArrowLeft className="size-5 text-[#3A4D39]" />
              </button>
              <h1 className="text-xl font-semibold text-[#3A4D39]">
                My Coupons
              </h1>
            </div>
          </div>
        </div>

        <div className="p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 overflow-hidden rounded-lg border border-dashed border-[#3A4D39]/30 bg-white"
          >
            <div className="relative bg-[#3A4D39]/5 p-4">
              {/* Coupon validity badge */}
              <div
                className={`absolute right-4 top-4 rounded-full px-2 py-1 text-xs ${
                  valid
                    ? expiringSoon
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {valid
                  ? expiringSoon
                    ? 'Expiring Soon'
                    : 'Active'
                  : 'Expired'}
              </div>

              {/* Coupon code and copy button */}
              <div className="mb-3 flex items-center">
                <Ticket className="mr-2 size-5 text-[#3A4D39]" />
                <h2 className="text-lg font-bold text-[#3A4D39]">
                  {selectedCoupon.code}
                </h2>
              </div>

              {/* Coupon discount value */}
              <div className="mb-3 text-2xl font-bold text-[#3A4D39]">
                {selectedCoupon.discountType === 'percentage'
                  ? `${selectedCoupon.discount}% OFF`
                  : `${formatToVND(selectedCoupon.discount)} OFF`}
              </div>

              {/* Coupon description */}
              <p className="text-sm text-gray-600">
                {selectedCoupon.description}
              </p>
            </div>

            {/* Coupon details */}
            <div className="border-t border-dashed border-gray-200 p-4">
              <div className="space-y-3">
                <div className="flex items-start">
                  <Clock className="mr-3 mt-1 size-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Valid Until</p>
                    <p className="text-sm font-medium">
                      {format(
                        parseISO(selectedCoupon.endDate),
                        'MMMM dd, yyyy'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Info className="mr-3 mt-1 size-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Minimum Order</p>
                    <p className="text-sm font-medium">
                      {formatToVND(selectedCoupon.minOrderValue)}
                    </p>
                  </div>
                </div>

                {selectedCoupon.maxDiscountAmount && (
                  <div className="flex items-start">
                    <Info className="mr-3 mt-1 size-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Maximum Discount</p>
                      <p className="text-sm font-medium">
                        {formatToVND(selectedCoupon.maxDiscountAmount)}
                      </p>
                    </div>
                  </div>
                )}

                {selectedCoupon.usageLimit && (
                  <div className="flex items-start">
                    <Info className="mr-3 mt-1 size-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Usage Limit</p>
                      <p className="text-sm font-medium">
                        {selectedCoupon.usageLimit} time
                        {selectedCoupon.usageLimit !== 1 ? 's' : ''} per user
                      </p>
                    </div>
                  </div>
                )}

                {selectedCoupon.categories &&
                  selectedCoupon.categories.length > 0 && (
                    <div className="flex items-start">
                      <Info className="mr-3 mt-1 size-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Applicable To</p>
                        <p className="text-sm font-medium">
                          {selectedCoupon.categories.join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Coupon action buttons */}
            <div className="border-t border-dashed border-gray-200 p-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  className="flex items-center justify-center rounded-md border border-[#3A4D39] px-4 py-2 text-sm font-medium text-[#3A4D39]"
                  onClick={() => handleCopyCode(selectedCoupon.code)}
                >
                  {copiedCode === selectedCoupon.code ? (
                    <>
                      <CheckCircle className="mr-2 size-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 size-4" />
                      Copy Code
                    </>
                  )}
                </button>
                <button
                  className="rounded-md bg-[#3A4D39] px-4 py-2 text-sm font-medium text-white"
                  onClick={() => {
                    // Store code in localStorage for checkout
                    localStorage.setItem('selectedCoupon', selectedCoupon.code)
                    navigate({ to: '/shop' })
                  }}
                >
                  Shop Now
                </button>
              </div>
            </div>
          </motion.div>

          {/* Terms and conditions */}
          <div className="rounded-lg border border-gray-100 bg-white p-4">
            <h3 className="mb-2 font-medium text-gray-800">
              Terms & Conditions
            </h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                • Coupon is valid for a single use only unless stated otherwise.
              </li>
              <li>• Cannot be combined with other coupons or promotions.</li>
              <li>• Discount applies to eligible items only.</li>
              <li>
                • De Fleur reserves the right to modify or cancel this coupon at
                any time.
              </li>
              <li>• Additional restrictions may apply.</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Main coupon list view
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="mr-3 rounded-full p-2 active:bg-gray-100"
              onClick={() => navigate({ to: '/account_manage' })}
            >
              <ArrowLeft className="size-5 text-[#3A4D39]" />
            </button>
            <h1 className="text-xl font-semibold text-[#3A4D39]">My Coupons</h1>
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-3 flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-2">
          <Search className="mr-2 size-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for coupons"
            className="flex-1 bg-transparent text-sm outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="rounded-full p-1 hover:bg-gray-200"
              onClick={() => setSearchQuery('')}
            >
              <X className="size-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Points display */}
        <div className="mt-3 rounded-lg bg-amber-50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-amber-800">
                Your Points
              </h3>
              <p className="text-xs text-amber-600">
                Use points to exchange for coupons
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
              <span className="text-lg font-bold text-amber-700">
                {userLoading ? '...' : userProfile?.point || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <div className="grid grid-cols-2">
          <button
            className={`py-3 text-center text-sm font-medium ${
              activeTab === 'my-coupons'
                ? 'border-b-2 border-[#3A4D39] text-[#3A4D39]'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('my-coupons')}
          >
            My Coupons
          </button>
          <button
            className={`py-3 text-center text-sm font-medium ${
              activeTab === 'available'
                ? 'border-b-2 border-[#3A4D39] text-[#3A4D39]'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('available')}
          >
            Available Coupons
          </button>
        </div>
      </div>

      {/* Filter pills - only show for my coupons */}
      {activeTab === 'my-coupons' && (
        <div className="border-b border-gray-100">
          {/* eslint-disable-next-line tailwindcss/no-custom-classname */}
          <div className="scrollbar-hide flex overflow-x-auto px-4 py-2">
            <button
              className={`mr-2 whitespace-nowrap rounded-full px-4 py-1.5 text-xs ${
                filter === 'all'
                  ? 'bg-[#3A4D39] text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setFilter('all')}
            >
              All Coupons
            </button>
            <button
              className={`mr-2 whitespace-nowrap rounded-full px-4 py-1.5 text-xs ${
                filter === 'active'
                  ? 'bg-[#3A4D39] text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button
              className={`mr-2 whitespace-nowrap rounded-full px-4 py-1.5 text-xs ${
                filter === 'expiring'
                  ? 'bg-[#3A4D39] text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setFilter('expiring')}
            >
              Expiring Soon
            </button>
          </div>
        </div>
      )}

      {/* Coupon list */}
      <div className="p-4">
        {activeTab === 'my-coupons' ? (
          filteredCoupons.length > 0 ? (
            <motion.div
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredCoupons.map((coupon: Coupon) => {
                const valid = isCouponValid(coupon)
                const expiringSoon = isExpiringSoon(coupon.endDate)

                return (
                  <motion.div
                    key={coupon.id}
                    className="relative overflow-hidden rounded-lg border border-dashed border-[#3A4D39]/30 bg-white"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleCouponSelect(coupon)}
                  >
                    {/* New badge */}
                    {coupon.isNew && (
                      <div className="absolute left-0 top-0 bg-[#3A4D39] px-2 py-1 text-[10px] font-bold text-white">
                        NEW
                      </div>
                    )}

                    <div className="relative bg-[#3A4D39]/5 p-4">
                      {/* Coupon validity badge */}
                      <div
                        className={`absolute right-4 top-4 rounded-full px-2 py-1 text-xs ${
                          valid
                            ? expiringSoon
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {valid
                          ? expiringSoon
                            ? 'Expiring Soon'
                            : 'Active'
                          : 'Expired'}
                      </div>

                      {/* Coupon code */}
                      <div className="mb-2 flex items-center">
                        <Ticket className="mr-2 size-4 text-[#3A4D39]" />
                        <h2 className="font-bold text-[#3A4D39]">
                          {coupon.code}
                        </h2>
                      </div>

                      {/* Coupon discount value */}
                      <div className="mb-2 text-xl font-bold text-[#3A4D39]">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discount}% OFF`
                          : `${formatToVND(coupon.discount)} OFF`}
                      </div>

                      {/* Coupon description */}
                      <p className="text-xs text-gray-600">
                        {coupon.description}
                      </p>

                      {/* Expiry date */}
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <Clock className="mr-1 size-3" />
                        <span>
                          Expires:{' '}
                          {format(parseISO(coupon.endDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex border-t border-dashed border-gray-200">
                      <button
                        className="flex flex-1 items-center justify-center border-r border-dashed border-gray-200 py-2 text-xs font-medium text-[#3A4D39]"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyCode(coupon.code)
                        }}
                      >
                        {copiedCode === coupon.code ? (
                          <>
                            <CheckCircle className="mr-1 size-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 size-3" />
                            Copy Code
                          </>
                        )}
                      </button>
                      <button
                        className="flex flex-1 items-center justify-center py-2 text-xs font-medium text-[#3A4D39]"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCouponSelect(coupon)
                        }}
                      >
                        <Info className="mr-1 size-3" />
                        Details
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            <motion.div
              className="mt-10 flex flex-col items-center justify-center p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 rounded-full bg-gray-50 p-6">
                <Ticket className="size-10 text-gray-300" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-gray-800">
                No Coupons Found
              </h2>
              <p className="mb-8 text-gray-500">
                {searchQuery
                  ? `No coupons matching "${searchQuery}"`
                  : filter === 'expiring'
                    ? "You don't have any coupons expiring soon"
                    : filter === 'active'
                      ? "You don't have any active coupons"
                      : "You don't have any coupons yet"}
              </p>
              <motion.button
                className="w-full rounded-md bg-[#3A4D39] px-6 py-3 text-white"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate({ to: '/shop' })}
              >
                Explore Shop
              </motion.button>
            </motion.div>
          )
        ) : availableCouponsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-8 animate-spin text-[#3A4D39]" />
          </div>
        ) : !availableCoupons?.length ? (
          <div className="py-8 text-center">
            <Ticket className="mx-auto size-12 text-gray-300" />
            <p className="mt-2 text-gray-500">
              No coupons available for exchange
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableCoupons.map((coupon: CouponResponse) => (
              <div
                key={coupon.id}
                className="overflow-hidden rounded-lg border border-gray-200"
              >
                <div className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-emerald-800">
                      {coupon.name}
                    </h3>
                    <div className="rounded-full bg-white px-2 py-1 text-xs font-medium">
                      {coupon.discount}% OFF
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Code:{' '}
                    <span className="font-mono font-medium">{coupon.code}</span>
                  </p>
                </div>
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="mr-1 size-3" />
                      Expires:{' '}
                      {format(parseISO(coupon.expiryDate), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center text-xs font-medium text-amber-600">
                      {coupon.pointRequired} points
                    </div>
                  </div>
                  {coupon.minimumOrderPrice > 0 && (
                    <p className="mb-3 text-xs text-gray-500">
                      Min. Order: {formatToVND(coupon.minimumOrderPrice)}
                    </p>
                  )}
                  <button
                    className={`mt-2 w-full rounded-md py-2 text-sm font-medium ${
                      (userProfile?.point || 0) >= (coupon.pointRequired || 0)
                        ? 'bg-[#3A4D39] text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                    disabled={
                      !userProfile ||
                      (userProfile.point || 0) < (coupon.pointRequired || 0) ||
                      exchangeCouponMutation.isPending
                    }
                    onClick={() => handleExchangeCoupon(coupon)}
                  >
                    {exchangeCouponMutation.isPending
                      ? 'Exchanging...'
                      : 'Exchange Coupon'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileCouponPage
