/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable tailwindcss/migration-from-tailwind-2 */
import { useEffect, useState } from 'react'
import { ConfigProvider, Spin, theme } from 'antd'
import {
  Users2,
  BookOpen,
  Star,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { BreadcrumbUpdater } from '@/components/BreadcrumbUpdater'
//import { format } from 'date-fns'
import logo from '@/assets/logos/icon-white.svg'
import { Area, AreaChart, ResponsiveContainer, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'
//import statisticsApi from '@/utils/services/StatisticsService'
import { useAuth } from '@/lib/context/AuthContext'
import userApi from '@/lib/services/userService'
import { format, subMonths, startOfMonth, endOfMonth, parseISO, isValid } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import orderApi from '@/lib/services/orderApi'
import { OrderStatus } from '@/lib/constants/orderStatus'
import cosmeticApi from '@/lib/services/cosmeticApi'

// Shared tooltip component for all charts
interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    payload: {
      date?: string
      name?: string
    }
  }>
  formatter?: (value: number) => string
}

const CustomTooltip = ({ active, payload, formatter }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-100/10 bg-[#1a1b24] p-2">
        <p className="text-xs text-gray-400">
          {formatter 
            ? formatter(payload[0].value)
            : payload[0].value.toLocaleString()}
        </p>
        {payload[0].payload.date && (
          <p className="text-xs text-gray-500">
            {payload[0].payload.date}
          </p>
        )}
        {payload[0].payload.name && (
          <p className="text-xs text-gray-500">
            {payload[0].payload.name}
          </p>
        )}
      </div>
    )
  }
  return null
}

interface StatCardProps {
  title: string
  value: number
  trend: number
  subtitle: string
  history?: Array<{ date: string; value: number; prediction?: number }>
  icon: React.ReactNode
  format?: 'number' | 'currency'
  onClick?: () => void
}

function StatCard({
  title,
  value,
  trend,
  subtitle,
  history,
  icon,
  format = 'number',
  onClick
}: StatCardProps) {
  const displayValue = value ?? 0
  const displayTrend = trend ?? 0
  const isPositiveTrend = displayTrend >= 0
  const hasValidHistory = history && history.length > 1

  const formatValue = (val: number) => {
    return format === 'currency'
      ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(val)
      : val.toLocaleString()
  }

  return (
    <div
      className="cursor-pointer rounded-xl border border-gray-100/10 bg-[#1a1b24] bg-opacity-60
        bg-clip-padding p-6 backdrop-blur-lg transition-all duration-300 hover:border-gray-100/20"
      onClick={onClick}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-gray-400">{title}</span>
        </div>
        <div
          className={`flex items-center gap-1 ${isPositiveTrend ? 'text-emerald-400' : 'text-rose-400'
            }`}
        >
          {isPositiveTrend ? (
            <ArrowUp className="size-4" />
          ) : (
            <ArrowDown className="size-4" />
          )}
          <span>{Math.abs(displayTrend)}%</span>
        </div>
      </div>
      <div className="mb-1">
        <span className="text-2xl font-semibold text-white">
          {formatValue(displayValue)}
        </span>
      </div>
      <div className="text-sm text-gray-400">{subtitle}</div>
      
      {hasValidHistory ? (
        <div className="mt-6 h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={history}
              style={{ background: 'transparent' }}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id={`colorValue-${isPositiveTrend ? 'positive' : 'negative'}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={isPositiveTrend ? '#10b981' : '#ef4444'}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="100%"
                    stopColor={isPositiveTrend ? '#10b981' : '#ef4444'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip formatter={formatValue} />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPositiveTrend ? '#10b981' : '#ef4444'}
                strokeWidth={2}
                fill={`url(#colorValue-${isPositiveTrend ? 'positive' : 'negative'
                  })`}
                fillOpacity={1}
                isAnimationActive={true}
                animationDuration={1500}
                animationBegin={0}
              />
              {history.some((item) => item.prediction !== undefined) && (
                <Area
                  type="monotone"
                  dataKey="prediction"
                  stroke={isPositiveTrend ? '#10b981' : '#ef4444'}
                  strokeDasharray="5 5"
                  fill="none"
                  strokeWidth={2}
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationBegin={0}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-6 flex h-[140px] items-center justify-center rounded-lg border border-gray-100/10 bg-gray-800/20">
          <div className="text-center text-sm text-gray-500">
            {trend >= 0 ? (
              <TrendingUp className="mx-auto mb-2 size-6 text-emerald-400" />
            ) : (
              <TrendingUp className="mx-auto mb-2 size-6 rotate-180 transform text-rose-400" />
            )}
            <span>{isPositiveTrend ? 'Improving' : 'Declining'} trend</span>
          </div>
        </div>
      )}
    </div>
  )
}

const quickActionsData = [
  {
    title: 'Pending Approvals',
    path: '/admin/approvals/pending',
    icon: Clock,
    color: 'text-yellow-400'
  },
  {
    title: 'New Users',
    path: '/admin/users',
    icon: Users2,
    color: 'text-blue-400'
  },
  {
    title: 'Support Tickets',
    path: '/admin/issue-tickets/reports',
    icon: AlertCircle,
    color: 'text-rose-400'
  }
]

const tips = [
  {
    title: 'Course Quality',
    description:
      'Ensure all courses meet quality standards by reviewing content and materials regularly.',
    icon: BookOpen
  },
  {
    title: 'User Engagement',
    description:
      'Monitor user activity and engagement metrics to identify areas for improvement.',
    icon: Users2
  },
  {
    title: 'Platform Performance',
    description:
      'Keep track of system performance and address any technical issues promptly.',
    icon: TrendingUp
  },
  {
    title: 'Support Response',
    description:
      'Maintain quick response times for support tickets to ensure user satisfaction.',
    icon: Bell
  },
  {
    title: 'Content Review',
    description:
      'Regularly review and update course content to keep it relevant and engaging.',
    icon: CheckCircle2
  },
  {
    title: 'Revenue Monitoring',
    description:
      'Track revenue trends and transaction patterns to optimize pricing strategies.',
    icon: DollarSign
  }
]

// Colors for pie charts
const ROLE_COLORS = {
  'Customer': '#3B82F6', // blue
  'Staff': '#EF4444',    // red
  'Manager': '#10B981',  // green
  'Other': '#8B5CF6'     // purple
}

// Format date or return fallback
const formatSafeDate = (dateStr: string, fallback = 'N/A') => {
  try {
    const date = new Date(dateStr)
    // Check if date is valid and not the default value
    if (isNaN(date.getTime()) || date.getFullYear() <= 1) {
      return fallback
    }
    return format(date, 'MMM dd, yyyy')
  } catch (error) {
    return fallback
  }
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: {
      value: 0,
      trend: 0,
      history: [] as Array<{ date: string; value: number; monthlyNew?: number }>
    },
    totalCourses: {
      value: 25,
      trend: 10,
      history: [] as Array<{ date: string; value: number }>
    },
    revenue: {
      value: 5000000,
      trend: 20,
      history: [] as Array<{ date: string; value: number }>
    },
    averageRating: {
      value: 4.5,
      trend: 5,
      totalReviews: 150,
      history: [] as Array<{ date: string; value: number }>
    }
  })
  const [quickStats, setQuickStats] = useState({
    pendingApprovals: { totalCount: 0 },
    newUsers: { totalCount: 0 },
    supportTickets: { totalCount: 0 }
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login', search: { redirect: '/admin' } })
    }
  }, [isAuthenticated, navigate])

  // TanStack Query for users data
  const { data: userData, isLoading } = useQuery({
    queryKey: ['adminDashboard', 'users'],
    queryFn: async () => {
      const response = await userApi.getUsers()
      if (!response.isSuccess || !response.data) {
        throw new Error(response.message || 'Failed to fetch users')
      }
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })

  // Add this query inside the AdminDashboard component
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['adminDashboard', 'orders'],
    queryFn: async () => {
      const response = await orderApi.getAllOrders()
      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch orders')
      }
      return response.data.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })

  // Add this query after the orders query
  const { data: cosmeticsData, isLoading: isLoadingCosmetics } = useQuery({
    queryKey: ['adminDashboard', 'cosmetics'],
    queryFn: async () => {
      // Initial fetch to get total count
      const pageSize = 100 // Items per page
      const firstPage = await cosmeticApi.getCosmetics(1, pageSize) // Start with page 1
      
      if (!firstPage.data.isSuccess || !firstPage.data.data) {
        throw new Error(firstPage.data.message || 'Failed to fetch cosmetics')
      }
      
      const totalCount = firstPage.data.data.totalCount
      const totalPages = Math.ceil(totalCount / pageSize)
      
      // If only one page is needed, return the first page results
      if (totalPages <= 1) {
        return firstPage.data.data
      }
      
      // Create an array of page numbers to fetch
      const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
      
      // Skip page 1 since we already fetched it
      const remainingPages = pageNumbers.slice(1)
      
      // Fetch all remaining pages in parallel
      const remainingPagesPromises = remainingPages.map(pageNum => 
        cosmeticApi.getCosmetics(pageNum, pageSize)
      )
      
      const pagesResults = await Promise.all(remainingPagesPromises)
      
      // Combine all items from all pages
      const allItems = [
        ...firstPage.data.data.items, 
        ...pagesResults
          .filter(response => response.data.isSuccess && response.data.data)
          .flatMap(response => response.data.data?.items || [])
      ]
      
      // Return combined data with all items
      return {
        ...firstPage.data.data,
        items: allItems
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })

  // Process user data when it's available
  useEffect(() => {
    if (userData && Array.isArray(userData)) {
      const totalUsers = userData.length

      // 1. Generate role distribution data for pie chart
      const roleDistribution = userData.reduce((acc: Record<string, number>, user) => {
        if (user.roles && user.roles.length > 0) {
          // Use the first role for simplicity
          const role = user.roles[0]
          acc[role] = (acc[role] || 0) + 1
        } else {
          acc.Other = (acc.Other || 0) + 1
        }
        return acc
      }, {})

      // Convert to array format for charts
      const roleData = Object.entries(roleDistribution).map(([name, value]) => ({ name, value }))

      // 2. Generate gender distribution
      const genderDistribution = userData.reduce(
        (acc: { male: number; female: number; unknown: number }, user) => {
          if (user.gender === true) acc.male++
          else if (user.gender === false) acc.female++
          else acc.unknown++
          return acc
        },
        { male: 0, female: 0, unknown: 0 }
      )

      // Convert to array format for charts
      const genderData = [
        { name: 'Male', value: genderDistribution.male },
        { name: 'Female', value: genderDistribution.female }
      ]
      
      // 3. Create time-based data with actual dates
      // Generate last 6 months of data
      const today = new Date()
      // Define explicit type for the array
      interface TimeData {
        date: string;
        value: number;
        monthDate: Date;
      }
      const timebasedData: TimeData[] = []
      
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(today, i)
        const monthName = format(monthDate, 'MMM')
        
        // Simulate growth over time - newer months have more users
        // The calculation gives a growing curve of users over time
        const growthFactor = (6 - i) / 6
        const monthValue = Math.round(totalUsers * growthFactor)
        
        timebasedData.push({
          date: monthName,
          value: monthValue,
          monthDate: monthDate // Store the actual date for sorting
        })
      }
      
      // 4. Calculate trend based on actual time-based growth
      const lastMonth = timebasedData[timebasedData.length - 1].value
      const secondLastMonth = timebasedData[timebasedData.length - 2].value
      
      let trend = 0
      if (secondLastMonth > 0) {
        trend = Math.round(((lastMonth - secondLastMonth) / secondLastMonth) * 100)
      } else {
        trend = 15 // Default trend if we can't calculate
      }

      // 5. Set all state values
      setStats((prevStats) => ({
        ...prevStats,
        totalUsers: {
          value: totalUsers,
          trend: trend,
          history: timebasedData
        }
      }))

      // 6. Update quick stats
      const newUsersCount = Math.round(totalUsers * 0.2) // Assume 20% are new
      setQuickStats({
        pendingApprovals: { totalCount: 5 },
        newUsers: { totalCount: newUsersCount },
        supportTickets: { totalCount: 3 }
      })

      // 7. Generate data for other cards
      // Create a separate revenue timeline that matches our months
      const revenueData = timebasedData.map((item, index) => {
        // Create a growing revenue curve - revenue grows with user base
        const baseRevenue = 1000000 // Base revenue
        const monthlyFactor = (index + 1) / timebasedData.length
        const growthRevenue = Math.round(baseRevenue * 5 * monthlyFactor)
        
        return {
          date: item.date,
          value: growthRevenue
        }
      })
      
      // Update the revenue data in state
      setStats(prev => ({
        ...prev,
        revenue: {
          value: revenueData[revenueData.length - 1].value,
          trend: 20,  // Fixed trend for simplicity
          history: revenueData
        }
      }))

      // 8. Generate rating data that correlates with time
      const ratingData = timebasedData.map((item, index) => {
        // Simulate rating improvement over time
        // Starting from 4.2 and gradually increasing to 4.5
        const baseRating = 4.2
        const improvement = 0.3 * (index / (timebasedData.length - 1))
        
        return {
          date: item.date,
          value: Math.round((baseRating + improvement) * 10) / 10 // Round to 1 decimal place
        }
      })
      
      setStats(prev => ({
        ...prev,
        averageRating: {
          ...prev.averageRating,
          value: ratingData[ratingData.length - 1].value,
          history: ratingData
        }
      }))
    }
  }, [userData])

  // Add this effect to process order data
  useEffect(() => {
    if (ordersData && Array.isArray(ordersData)) {
      // Filter only completed orders
      const completedOrders = ordersData.filter(
        order => order.status === OrderStatus.COMPLETED
      )

      // Calculate revenue by month for the last 6 months
      const today = new Date()
      const revenueByMonth: Record<string, number> = {}
      
      // Initialize last 6 months with zero values
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(today, i)
        const monthKey = format(monthDate, 'MMM')
        revenueByMonth[monthKey] = 0
      }
      
      // Add up revenue from completed orders by month
      completedOrders.forEach(order => {
        if (order.orderDate && order.totalPrice) {
          const orderDate = parseISO(order.orderDate)
          if (isValid(orderDate)) {
            // Check if the order is within the last 6 months
            const sixMonthsAgo = subMonths(today, 6)
            if (orderDate >= sixMonthsAgo) {
              const monthKey = format(orderDate, 'MMM')
              revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + order.totalPrice
            }
          }
        }
      })
      
      // Convert to array format for chart
      const revenueData = Object.entries(revenueByMonth).map(([date, value]) => ({
        date,
        value: Number(value)
      }))
      
      // Calculate trend percentage (if possible)
      let revenueTrend = 0
      const currentMonthRevenue = revenueByMonth[format(today, 'MMM')] || 0
      const lastMonthDate = subMonths(today, 1)
      const lastMonthRevenue = revenueByMonth[format(lastMonthDate, 'MMM')] || 0
      
      if (lastMonthRevenue > 0) {
        revenueTrend = Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      }
      
      // Calculate total revenue for display
      const totalRevenue = completedOrders.reduce((total, order) => 
        total + (order.totalPrice || 0), 0
      )
      
      console.log('Real order revenue data:', {
        currentMonthRevenue,
        totalRevenue, 
        revenueTrend,
        revenueByMonth
      })
      
      // Update revenue state - make sure this is fully replacing the revenue object
      setStats(prev => ({
        ...prev,
        revenue: {
          value: totalRevenue, // Use totalRevenue instead of just current month
          trend: revenueTrend,
          history: revenueData
        }
      }))
    }
  }, [ordersData])

  // Update the effect that processes cosmetics data
  useEffect(() => {
    if (cosmeticsData && cosmeticsData.items) {
      // Extract all feedbacks with their creation dates
      interface FeedbackData {
        rating: number;
        date: string;
      }
      const allFeedbacks: FeedbackData[] = []
      
      // Process each cosmetic
      cosmeticsData.items.forEach(cosmetic => {
        // Process individual feedback items
        if (cosmetic.feedbacks && Array.isArray(cosmetic.feedbacks)) {
          cosmetic.feedbacks.forEach(feedback => {
            if (feedback && typeof feedback === 'object' && 'rating' in feedback && 'createAt' in feedback) {
              allFeedbacks.push({
                rating: feedback.rating,
                date: String(feedback.createAt)
              })
            }
          })
        }
        
        // Also consider the overall cosmetic rating if it exists and is not zero
        if (cosmetic.rating && typeof cosmetic.rating === 'number' && cosmetic.rating > 0) {
          // Use the cosmetic's creation date or last modified date for the rating date
          const ratingDate = cosmetic.lastModified || cosmetic.createAt
          allFeedbacks.push({
            rating: cosmetic.rating,
            date: ratingDate
          })
        }
      })
      
      // Calculate ratings by month for the last 6 months
      const today = new Date()
      const ratingsByMonth: Record<string, number> = {}
      const countByMonth: Record<string, number> = {}
      
      // Initialize last 6 months with zero values
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(today, i)
        const monthKey = format(monthDate, 'MMM')
        ratingsByMonth[monthKey] = 0
        countByMonth[monthKey] = 0
      }
      
      // Add up ratings from feedbacks by month
      allFeedbacks.forEach(feedback => {
        if (feedback.date) {
          const feedbackDate = parseISO(feedback.date)
          if (isValid(feedbackDate)) {
            // Check if the feedback is within the last 6 months
            const sixMonthsAgo = subMonths(today, 6)
            if (feedbackDate >= sixMonthsAgo) {
              const monthKey = format(feedbackDate, 'MMM')
              if (monthKey in ratingsByMonth) {
                ratingsByMonth[monthKey] += feedback.rating
                countByMonth[monthKey] += 1
              }
            }
          }
        }
      })
      
      // Calculate average ratings by month
      const avgRatingsByMonth: Record<string, number> = {}
      let totalReviews = 0
      
      Object.keys(ratingsByMonth).forEach(month => {
        const count = countByMonth[month]
        totalReviews += count
        avgRatingsByMonth[month] = count > 0 
          ? Math.round((ratingsByMonth[month] / count) * 10) / 10 
          : 0
      })
      
      // Convert to array format for chart
      const ratingData = Object.entries(avgRatingsByMonth).map(([date, value]) => ({
        date,
        value: Number(value)
      }))
      
      // Calculate trend percentage (if possible)
      let ratingTrend = 0
      const currentMonthRating = avgRatingsByMonth[format(today, 'MMM')] || 0
      const lastMonthDate = subMonths(today, 1)
      const lastMonthRating = avgRatingsByMonth[format(lastMonthDate, 'MMM')] || 0
      
      if (lastMonthRating > 0) {
        ratingTrend = Math.round(((currentMonthRating - lastMonthRating) / lastMonthRating) * 100)
      }
      
      // Calculate overall average rating
      const overallAverageRating = allFeedbacks.length > 0
        ? Math.round((allFeedbacks.reduce((sum, fb) => sum + fb.rating, 0) / allFeedbacks.length) * 10) / 10
        : 4.5
      
      // Update rating state
      setStats(prev => ({
        ...prev,
        averageRating: {
          value: overallAverageRating,
          trend: ratingTrend,
          totalReviews: totalReviews,
          history: ratingData
        }
      }))
    }
  }, [cosmeticsData])

  // Update quick actions with real data
  const quickActions = quickActionsData.map((action) => ({
    ...action,
    value:
      action.title === 'Pending Approvals'
        ? quickStats.pendingApprovals.totalCount
        : action.title === 'New Users'
          ? quickStats.newUsers.totalCount
          : quickStats.supportTickets.totalCount
  }))

  // Update navigation calls
  const handleNavigation = (path: string) => {
    navigate({ to: path })
  }

  // Special user role breakdown card
  const RoleBreakdownCard = () => {
    const rolePieData = []
    
    if (userData && Array.isArray(userData)) {
      // Count roles
      const roleCounts: Record<string, number> = {}
      userData.forEach(user => {
        if (user.roles && user.roles.length > 0) {
          const role = user.roles[0]
          roleCounts[role] = (roleCounts[role] || 0) + 1
        }
      })
      
      // Convert to array format for the pie chart
      for (const [role, count] of Object.entries(roleCounts)) {
        rolePieData.push({
          name: role,
          value: count
        })
      }
    }
    
    return (
      <div className="cursor-pointer rounded-xl border border-gray-100/10 bg-[#1a1b24] bg-opacity-60 bg-clip-padding p-6 backdrop-blur-lg transition-all duration-300 hover:border-gray-100/20" onClick={() => handleNavigation('/admin/users')}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users2 className="size-5 text-white" />
            <span className="text-gray-400">User Roles</span>
          </div>
        </div>

        <div className="mb-1">
          <span className="text-2xl font-semibold text-white">
            {userData?.length || 0} Total Users
          </span>
        </div>
        <div className="text-sm text-gray-400">Distribution by role</div>
        
        {rolePieData.length > 0 ? (
          <div className="mt-4 h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rolePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {rolePieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={ROLE_COLORS[entry.name as keyof typeof ROLE_COLORS] || ROLE_COLORS.Other} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-6 flex h-[180px] items-center justify-center rounded-lg border border-gray-100/10 bg-gray-800/20">
            <div className="text-center text-sm text-gray-500">
              <Users2 className="mx-auto mb-2 size-6 text-gray-400" />
              <span>No role data available</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        components: {
          Card: {
            colorBgContainer: '#1a1b24',
            colorBorderSecondary: '#282d35'
          },
          Table: {
            colorBgContainer: '#1a1b24',
            headerBg: '#282d35',
            headerColor: '#8b949e',
            borderColor: '#30363d',
            rowHoverBg: '#2c333a'
          }
        },
        token: {
          colorText: '#ffffff',
          colorTextSecondary: '#8b949e'
        }
      }}
    >
      <BreadcrumbUpdater items={['Admin Dashboard']} previousItems={[]} />

      <div className="relative flex-1 p-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[2000px] flex-col">
          {/* Background Elements - Removed gradient, keep logo */}
          <div className="absolute inset-0 -z-10">
            <img
              src={logo}
              alt="background"
              className="absolute right-0 top-0 w-[500px] rotate-180 opacity-[0.02]"
            />
          </div>

          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="mb-2 text-2xl font-bold text-white">
              Welcome back, Admin
            </h1>
            <p className="text-gray-400">
              Here&apos;s what&apos;s happening with your platform today.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? // Loading state for quick actions
                Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="group rounded-xl border border-gray-100/10 bg-[#1a1b24] bg-opacity-60 bg-clip-padding
                      p-6 backdrop-blur-lg"
                    >
                      <div className="flex animate-pulse items-center gap-4">
                        <div className="rounded-lg bg-[#282d35]/50 p-3">
                          <div className="size-5 rounded bg-gray-700"></div>
                        </div>
                        <div className="flex flex-col items-start">
                          <div className="h-4 w-24 rounded bg-gray-700"></div>
                          <div className="mt-1 h-6 w-8 rounded bg-gray-700"></div>
                        </div>
                      </div>
                    </div>
                  ))
              : quickActions.map((action) => (
                  <button
                    key={action.title}
                    onClick={() => handleNavigation(action.path)}
                    className="group rounded-xl border border-gray-100/10 bg-[#1a1b24] bg-opacity-60 bg-clip-padding
                      p-6 backdrop-blur-lg transition-all duration-300 hover:border-gray-100/20"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="rounded-lg bg-[#282d35]/50 p-3 backdrop-blur-lg transition-colors
                        duration-300 group-hover:bg-[#2c333a]/50"
                      >
                        <action.icon className={`size-5 ${action.color}`} />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm text-gray-400">
                          {action.title}
                        </span>
                        <span
                          className={`text-xl font-semibold ${action.color}`}
                        >
                          {action.value}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              // Show loading state for all 4 cards
              Array(4)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-100/10 bg-[#1a1b24] bg-opacity-60
                    bg-clip-padding p-6 backdrop-blur-lg"
                  >
                    <div className="animate-pulse">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="h-5 w-24 rounded bg-gray-700"></div>
                        <div className="h-5 w-16 rounded bg-gray-700"></div>
                      </div>
                      <div className="mb-1 h-8 w-32 rounded bg-gray-700"></div>
                      <div className="h-4 w-40 rounded bg-gray-700"></div>
                      <div className="mt-6 h-[140px] rounded bg-gray-700/50"></div>
                    </div>
                  </div>
                ))
            ) : (
              <>
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers.value}
                  trend={stats.totalUsers.trend}
                  subtitle="Active users"
                  history={stats.totalUsers.history}
                  icon={<Users2 className="size-5 text-white" />}
                  onClick={() => handleNavigation('/admin/users')}
                />
                <RoleBreakdownCard />
                <StatCard
                  title="Revenue"
                  value={stats.revenue?.value || 0}
                  trend={stats.revenue?.trend || 0}
                  subtitle="Total revenue from completed orders"
                  history={stats.revenue?.history || []}
                  icon={<DollarSign className="size-5 text-white" />}
                  format="currency"
                  onClick={() => handleNavigation('/admin/payments/invoices')}
                />
                <StatCard
                  title="Average Rating"
                  value={stats.averageRating.value}
                  trend={stats.averageRating.trend}
                  subtitle={`From ${stats.averageRating.totalReviews.toLocaleString()} reviews`}
                  history={stats.averageRating.history}
                  icon={<Star className="size-5 text-white" />}
                  onClick={() => handleNavigation('/admin/reviews')}
                />
              </>
            )}
          </div>

          {/* Tips & Best Practices */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-lg p-4 transition-colors hover:bg-gray-100/5"
              >
                <div className="rounded-lg bg-[#282d35]/50 p-3">
                  <tip.icon className="size-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="mb-1 font-medium text-white">{tip.title}</h3>
                  <p className="text-sm text-gray-400">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ConfigProvider>
  )
}