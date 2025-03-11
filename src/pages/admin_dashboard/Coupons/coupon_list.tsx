import { useState, useCallback, useMemo, useEffect } from 'react'
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

export default function CouponList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchText, setSearchText] = useState('')
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<DataType | null>(null)

  // Fetch coupons
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const response = await couponApi.getCoupons()
      if (!response.data.isSuccess || !response.data) {
        throw new Error(response.data.message || 'Failed to fetch coupons')
      }
      return response.data.data
    }
  })

  // Format data for the table
  const dataSource = useMemo(() => {
    return coupons.map((coupon) => ({
      ...coupon,
      key: coupon.id
    }))
  }, [coupons])

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchText) return dataSource

    return dataSource.filter(
      (item) =>
        item.code?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.discount.toString().includes(searchText)
    )
  }, [dataSource, searchText])

  // Handle delete coupon
  const handleDelete = useCallback(() => {
    if (!selectedCoupon) return

    Modal.confirm({
      title: 'Are you sure you want to delete this coupon?',
      content: `Coupon code: ${selectedCoupon.code || 'No code'} (Discount: ${selectedCoupon.discount})`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await couponApi.deleteCoupon(selectedCoupon.id)
          message.success('Coupon deleted successfully')
          queryClient.invalidateQueries({ queryKey: ['coupons'] })
        } catch (error) {
          console.error('Error deleting coupon:', error)
          message.error('Failed to delete coupon')
        }
      }
    })
  }, [selectedCoupon, queryClient])

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
          : coupon.expiryDate instanceof Date
            ? coupon.expiryDate.toISOString()
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

  // Define columns for the table
  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (code: string | null) => (
        <div className="flex items-center">
          <Hash className="mr-2 size-4 text-blue-400" />
          {code || <span className="italic text-gray-400">No code</span>}
        </div>
      )
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
      render: (discount: number) => (
        <div className="flex items-center">
          <Percent className="mr-2 size-4 text-green-400" />
          {discount}%
        </div>
      )
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
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
      render: (limit: number) => limit
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: DataType) => {
        const { status, color } = getCouponStatus(record)
        return <Tag color={color}>{status}</Tag>
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: DataType) => (
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
                onClick: () => {
                  setSelectedCoupon(record)
                  handleDelete()
                }
              }
            ]
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<EllipsisOutlined />} />
        </Dropdown>
      )
    }
  ]

  // Theme configuration to match existing admin pages
  const tableTheme = {
    components: {
      Card: {
        colorBgContainer: '#141414',
        colorBorderSecondary: '#303030',
        colorText: '#e5e7eb'
      },
      Table: {
        colorBgContainer: '#141414',
        colorText: '#e5e7eb',
        colorBgElevated: '#1f1f1f',
        colorTextSecondary: '#9ca3af',
        colorTextTertiary: '#6b7280',
        colorIcon: '#9ca3af',
        colorBorderSecondary: '#303030',
        colorSplit: '#303030'
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
      colorBgElevated: '#1f1f1f',
      colorBorder: '#303030',
      borderRadius: 6,
      controlHeight: 36
    }
  }

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

  return (
    <ConfigProvider theme={tableTheme}>
      <BreadcrumbUpdater
        items={['Admin Dashboard', 'Coupons']}
        previousItems={['Admin Dashboard']}
      />
      <motion.div
        className="mx-auto mt-32 w-4/5"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <motion.h1
              className="mb-2 text-2xl font-bold text-white"
              variants={itemVariants}
            >
              Coupons
            </motion.h1>
            <motion.p className="text-gray-400" variants={itemVariants}>
              Manage discount coupons for your store
            </motion.p>
          </div>
          <motion.div variants={itemVariants}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate({ to: '/admin/coupons/create' })}
              className="mr-4"
            >
              Create Coupon
            </Button>
          </motion.div>
        </div>

        <MotionCard variants={itemVariants}>
          <div className="mb-4 flex justify-end">
            <Input
              placeholder="Search coupons"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64"
            />
          </div>

          <Table
            dataSource={filteredData}
            columns={columns}
            loading={isLoading}
            rowClassName="bg-gray-900 hover:bg-gray-800"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} coupons`,
              pageSizeOptions: ['10', '20', '50']
            }}
            locale={{
              emptyText: (
                <div className="flex flex-col items-center py-8">
                  <AlertCircle className="mb-2 size-10 text-gray-400" />
                  <span className="text-gray-400">No coupons found</span>
                </div>
              )
            }}
          />
        </MotionCard>
      </motion.div>
    </ConfigProvider>
  )
}
