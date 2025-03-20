/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  Table,
  ConfigProvider,
  Dropdown,
  Button,
  Modal,
  message,
  Card,
  Input,
  Tag
} from 'antd'
import {
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { useNavigate } from '@tanstack/react-router'
import React from 'react'
import { BreadcrumbUpdater } from '@/components/BreadcrumbUpdater'
import couponApi from '@/lib/services/couponApi'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CouponResponse } from '@/lib/types/Coupon'
import dayjs from 'dayjs'
import { Percent, Calendar, Hash, AlertCircle } from 'lucide-react'

interface DataType extends CouponResponse {
  key: string
}

// Highlight text component
const HighlightText = ({
  text,
  searchText
}: {
  text: string
  searchText: string
}) => {
  if (!searchText || !text) return <span>{text}</span>
  const parts = text.split(new RegExp(`(${searchText})`, 'gi'))
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === searchText.toLowerCase() ? (
          <span key={i} className="bg-yellow-500/30">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  )
}

HighlightText.displayName = 'HighlightText'
const MemoizedHighlightText = React.memo(HighlightText)

const CountdownTimer = ({ expiryDate }: { expiryDate: string }) => {
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = dayjs()
      const expiry = dayjs(expiryDate)
      const diff = expiry.diff(now, 'millisecond')

      if (diff <= 0) {
        setIsExpired(true)
        setTimeLeft('Expired')
        return
      }

      // Calculate days, hours, minutes, seconds
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      )
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      // Format the time left
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [expiryDate])

  const getColorClass = () => {
    if (isExpired) return 'text-red-500'

    const now = dayjs()
    const expiry = dayjs(expiryDate)
    const diff = expiry.diff(now, 'day')

    if (diff < 1) return 'text-red-400'
    if (diff < 3) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <span className={`ml-2 text-xs font-medium ${getColorClass()}`}>
      {isExpired ? 'Expired' : timeLeft}
    </span>
  )
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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const MotionCard = motion(Card)

export default function CouponList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchText, setSearchText] = useState('')
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<DataType | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Add pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 7,
    total: 0
  })

  // Fetch all coupons - remove searchText from the queryKey
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['coupons'], // Removed searchText from queryKey since backend doesn't handle search
    queryFn: async () => {
      const response = await couponApi.getAll()

      // Check if data exists and is an array
      if (response.data.isSuccess && Array.isArray(response.data.data)) {
        // Update total for pagination (inside the conditional check)
        setPagination((prev) => ({
          ...prev,
          total: response.data.data?.length || 0
        }))

        // Map the data to include keys
        return response.data.data.map((coupon) => ({
          ...coupon,
          key: coupon.id
        }))
      }

      return []
    }
  })

  // Filter coupons based on search
  const filteredData = useMemo(() => {
    if (!coupons) return []

    // First filter by search text
    const filtered = !searchText
      ? coupons
      : coupons.filter(
          (item) =>
            (item.code?.toLowerCase() || '').includes(
              searchText.toLowerCase()
            ) ||
            item.discount.toString().includes(searchText) ||
            (item.name?.toLowerCase() || '').includes(searchText.toLowerCase())
        )

    // Apply client-side pagination
    const startIndex = (pagination.current - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize

    return filtered.slice(startIndex, endIndex)
  }, [coupons, searchText, pagination])

  // Handle search with improved debounce - client-side only
  const handleSearch = useCallback((value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchText(value.toLowerCase())
      setPagination((prev) => ({ ...prev, current: 1 }))
    }, 10) // Client-side filtering can be faster
  }, [])

  // Make sure to clear timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Check if coupon is expired
  const isExpired = useCallback((expiryDate: string) => {
    return dayjs(expiryDate).isBefore(dayjs())
  }, [])

  // Get coupon status
  const getCouponStatus = useCallback(
    (coupon: DataType) => {
      // Check if expiryDate is already a string or needs conversion
      const expiryDateString =
        typeof coupon.expiryDate === 'string'
          ? coupon.expiryDate
          : typeof coupon.expiryDate === 'object' && coupon.expiryDate !== null
            ? new Date(coupon.expiryDate).toISOString()
            : String(coupon.expiryDate)

      if (isExpired(expiryDateString)) {
        return { status: 'Expired', color: 'error' }
      }

      if (coupon.usageLimit === 0) {
        return { status: 'Used', color: 'default' }
      }

      return { status: 'Active', color: 'success' }
    },
    [isExpired]
  )

  // Handle delete coupon
  const handleDelete = useCallback(
    (record: DataType) => {
      Modal.confirm({
        title: 'Are you sure you want to delete this coupon?',
        content: `Coupon code: ${record.code || 'No code'} (Discount: ${
          record.discount
        }%)`,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          try {
            await couponApi.delete(record.id)
            message.success('Coupon deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['coupons'] })
          } catch (error) {
            console.error('Error deleting coupon:', error)
            message.error('Failed to delete coupon')
          }
        }
      })
    },
    [queryClient]
  )

  // Handle table pagination change
  const handleTableChange = (newPagination: any) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    })
  }

  // Define columns for the table
  const columns = useMemo(
    () => [
      {
        title: 'Code',
        dataIndex: 'code',
        key: 'code',
        width: '20%',
        render: (code: string | null) => (
          <div className="flex items-center">
            <Hash className="mr-2 size-4 text-blue-400" />
            <MemoizedHighlightText
              text={code || 'No code'}
              searchText={searchText}
            />
          </div>
        )
      },
      {
        title: 'Discount',
        dataIndex: 'discount',
        key: 'discount',
        width: '15%',
        render: (discount: number) => (
          <div className="flex items-center">
            <Percent className="mr-2 size-4 text-green-400" />
            <MemoizedHighlightText
              text={`${discount}%`}
              searchText={searchText}
            />
          </div>
        )
      },
      {
        title: 'Expiry Date',
        dataIndex: 'expiryDate',
        key: 'expiryDate',
        width: '25%',
        render: (date: string) => (
          <div className="flex items-center">
            <Calendar className="mr-2 size-4 text-purple-400" />
            <div className="flex flex-col">
              <span>{dayjs(date).format('YYYY-MM-DD HH:mm')}</span>
              {!isExpired(date) && <CountdownTimer expiryDate={date} />}
            </div>
          </div>
        )
      },
      {
        title: 'Usage Limit',
        dataIndex: 'usageLimit',
        key: 'usageLimit',
        width: '15%',
        render: (limit: number) => limit
      },
      {
        title: 'Status',
        key: 'status',
        width: '15%',
        render: (_: any, record: DataType) => {
          const { status, color } = getCouponStatus(record)
          return <Tag color={color}>{status}</Tag>
        }
      },
      {
        title: 'Actions',
        key: 'actions',
        width: '10%',
        render: (_: any, record: DataType) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'edit',
                  icon: <EditOutlined />,
                  label: 'Edit',
                  onClick: () =>
                    navigate({ to: `/admin/coupons/edit/${record.id}` })
                },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: 'Delete',
                  danger: true,
                  onClick: () => handleDelete(record)
                }
              ]
            }}
            trigger={['click']}
          >
            <Button
              type="text"
              icon={<EllipsisOutlined />}
              className="text-gray-400 hover:text-blue-400"
            />
          </Dropdown>
        )
      }
    ],
    [searchText, handleDelete, navigate, isExpired, getCouponStatus]
  )

  // Theme configuration to match existing admin pages
  const tableTheme = {
    components: {
      Table: {
        colorBgContainer: '#141414',
        colorBgElevated: '#1f1f1f',
        colorBorderSecondary: '#303030',
        borderRadius: 8,
        padding: 16,
        colorText: '#e5e7eb',
        colorTextSecondary: '#9ca3af',
        fontSize: 14,
        controlItemBgHover: '#262626',
        headerBg: '#1f1f1f',
        headerColor: '#e5e7eb',
        rowHoverBg: '#262626',
        selectionColumnWidth: 48,
        selectionBg: 'rgba(74, 222, 128, 0.08)',
        selectionColor: '#e5e7eb'
      },
      Card: {
        colorBgContainer: '#141414',
        colorBorderSecondary: '#303030',
        colorText: '#e5e7eb',
        colorTextHeading: '#e5e7eb'
      },
      Pagination: {
        colorText: '#9ca3af',
        colorPrimary: '#3b82f6',
        colorBgContainer: 'transparent',
        colorBgTextHover: '#1f2937',
        colorTextDisabled: '#4b5563',
        fontSize: 14,
        controlHeight: 32,
        borderRadius: 6
      },
      Button: {
        colorPrimary: '#3b82f6',
        colorPrimaryHover: '#2563eb',
        colorText: '#e5e7eb',
        colorBgContainer: '#1f1f1f',
        colorBorder: '#303030'
      },
      Modal: {
        colorBgElevated: '#1f1f1f',
        colorText: '#e5e7eb',
        colorTextSecondary: '#9ca3af',
        colorIcon: '#9ca3af',
        colorBgMask: 'rgba(0, 0, 0, 0.7)'
      },
      Input: {
        colorText: '#e5e7eb',
        colorBgContainer: '#1f1f1f',
        colorBorder: '#303030',
        colorPrimaryHover: '#3b82f6'
      },
      Dropdown: {
        colorBgElevated: '#1f1f1f',
        colorText: '#e5e7eb',
        colorTextSecondary: '#9ca3af',
        colorBgContainer: '#1f1f1f',
        controlItemBgHover: '#283548',
        colorBorder: '#303030'
      }
    },
    token: {
      colorText: '#e5e7eb',
      colorTextSecondary: '#9ca3af',
      colorTextTertiary: '#6b7280',
      colorBgContainer: '#141414',
      colorBorder: '#303030',
      borderRadius: 6,
      controlHeight: 32
    }
  }

  return (
    <ConfigProvider theme={tableTheme}>
      <BreadcrumbUpdater
        items={['Admin Dashboard', 'Coupons', 'All Coupons']}
        previousItems={['Admin Dashboard']}
      />
      <motion.div
        className="mx-auto mt-32 w-4/5"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <MotionCard
          variants={itemVariants}
          title={
            <motion.div
              className="flex items-center justify-between"
              variants={itemVariants}
            >
              <span className="text-lg font-semibold">Coupon Management</span>
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Input
                    prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                    placeholder="Search coupons..."
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-64"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate({ to: '/admin/coupons/create' })}
                  >
                    Create Coupon
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          }
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Table
              columns={columns}
              dataSource={filteredData}
              loading={isLoading}
              rowClassName="bg-gray-900 hover:bg-gray-800"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: coupons.length,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} coupons`,
                pageSizeOptions: ['7', '15', '30', '50']
              }}
              onChange={handleTableChange}
              locale={{
                emptyText: (
                  <div className="flex flex-col items-center py-8">
                    <AlertCircle className="mb-2 size-10 text-gray-400" />
                    <span className="text-gray-400">No coupons found</span>
                  </div>
                )
              }}
            />
          </motion.div>
        </MotionCard>
      </motion.div>
    </ConfigProvider>
  )
}
