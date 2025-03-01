import { useEffect } from 'react'
import { ConfigProvider } from 'antd'
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
import { Area, AreaChart, ResponsiveContainer, YAxis, Tooltip } from 'recharts'
//import statisticsApi from '@/utils/services/StatisticsService'
import { useAuth } from '@/lib/context/AuthContext'

interface StatCardProps {
  title: string
  value: number
  trend: number
  subtitle: string
  history: Array<{ date: string; value: number; prediction?: number }>
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

  interface TooltipProps {
    active?: boolean
    payload?: Array<{
      value: number
      payload: {
        date?: string
      }
    }>
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-100/10 bg-[#1a1b24] p-2">
          <p className="text-xs text-gray-400">
            {format === 'currency'
              ? new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(payload[0].value)
              : payload[0].value.toLocaleString()}
          </p>
          {payload[0].payload.date && (
            <p className="text-xs text-gray-500">
              {new Date(payload[0].payload.date).toLocaleDateString()}
            </p>
          )}
        </div>
      )
    }
    return null
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
          className={`flex items-center gap-1 ${
            isPositiveTrend ? 'text-emerald-400' : 'text-rose-400'
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
          {format === 'currency'
            ? new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(displayValue)
            : displayValue.toLocaleString()}
        </span>
      </div>
      <div className="text-sm text-gray-400">{subtitle}</div>
      {history && history.length > 0 && (
        <div className="mt-6 h-[100px]">
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
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPositiveTrend ? '#10b981' : '#ef4444'}
                strokeWidth={2}
                fill={`url(#colorValue-${
                  isPositiveTrend ? 'positive' : 'negative'
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

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  // Commented out until stats API is ready
  // const [stats, setStats] = useState<any>(null)
  // const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, navigate])

  // Temporary mock data for UI development
  const mockStats = {
    pendingApprovals: { totalCount: 5 },
    newUsers: { totalCount: 12 },
    supportTickets: { totalCount: 3 },
    totalUsers: { value: 100, trend: 15, history: [] },
    totalCourses: { value: 25, trend: 10, history: [] },
    revenue: { value: 5000000, trend: 20, history: [] },
    averageRating: { value: 4.5, trend: 5, totalReviews: 150, history: [] }
  }

  const quickActions = quickActionsData.map((action) => ({
    ...action,
    value:
      action.title === 'Pending Approvals'
        ? mockStats.pendingApprovals.totalCount
        : action.title === 'New Users'
          ? mockStats.newUsers.totalCount
          : mockStats.supportTickets.totalCount
  }))

  // Update navigation calls
  const handleNavigation = (path: string) => {
    navigate({ to: path })
  }

  return (
    <ConfigProvider
      theme={{
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
            {quickActions.map((action) => (
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
                    <span className={`text-xl font-semibold ${action.color}`}>
                      {action.value}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={mockStats.totalUsers.value}
              trend={mockStats.totalUsers.trend}
              subtitle="Active this month"
              history={mockStats.totalUsers.history}
              icon={<Users2 className="size-5 text-white" />}
              onClick={() => handleNavigation('/admin/users')}
            />
            <StatCard
              title="Total Courses"
              value={mockStats.totalCourses.value}
              trend={mockStats.totalCourses.trend}
              subtitle="Published courses"
              history={mockStats.totalCourses.history}
              icon={<BookOpen className="size-5 text-white" />}
              onClick={() => handleNavigation('/admin/courses')}
            />
            <StatCard
              title="Revenue"
              value={mockStats.revenue?.value || 0}
              trend={mockStats.revenue?.trend || 0}
              subtitle="Total revenue from successful transactions"
              history={mockStats.revenue?.history || []}
              icon={<DollarSign className="size-5 text-white" />}
              format="currency"
              onClick={() => handleNavigation('/admin/payments/invoices')}
            />
            <StatCard
              title="Average Rating"
              value={mockStats.averageRating.value}
              trend={mockStats.averageRating.trend}
              subtitle={`From ${mockStats.averageRating.totalReviews.toLocaleString()} reviews`}
              history={mockStats.averageRating.history}
              icon={<Star className="size-5 text-white" />}
              onClick={() => handleNavigation('/admin/reviews')}
            />
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
