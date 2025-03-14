/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Card,
  ConfigProvider,
  message,
  Divider,
  Spin
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { BreadcrumbUpdater } from '@/components/BreadcrumbUpdater'
import couponApi from '@/lib/services/couponApi'
import { Percent, ShieldCheck, AlertCircle } from 'lucide-react'
import dayjs from 'dayjs'
import { CouponResponse, CouponUpdateRequest } from '@/lib/types/Coupon'

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

export default function EditCoupon() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/admin/coupons/edit/$id' })
  const queryClient = useQueryClient()
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch coupon data
  const { data: coupon, isLoading } = useQuery({
    queryKey: ['coupon', id],
    queryFn: async () => {
      const existingCoupon = queryClient
        .getQueryData<CouponResponse[]>(['coupons'])
        ?.find((coupon) => coupon.id === id)

      if (existingCoupon) {
        return existingCoupon
      }

      // If not found in cache, you might need a getCouponById endpoint
      // This is a fallback in case the coupon isn't in the cache
      const response = await couponApi.getCoupons()
      if (!response.data.isSuccess || !response.data) {
        throw new Error(response.data.message || 'Failed to fetch coupon')
      }
      return response.data.data!.find((coupon) => coupon.id === id)
    },
    enabled: !!id
  })

  // Set form values when coupon data is loaded
  useEffect(() => {
    if (coupon) {
      form.setFieldsValue({
        code: coupon.code,
        discount: coupon.discount,
        expiryDate: dayjs(coupon.expiryDate),
        usageLimit: coupon.usageLimit
      })
    }
  }, [coupon, form])

  // Update coupon mutation
  const updateCouponMutation = useMutation({
    mutationFn: (values: any) => {
      console.log('Updating coupon data:', values) // Debug log

      const couponUpdate: CouponUpdateRequest = {
        id: id,
        code: values.code,
        discount: values.discount,
        expiryDate: values.expiryDate.toISOString(),
        usageLimit: values.usageLimit
      }

      return couponApi.updateCoupon(couponUpdate)
    },
    onSuccess: () => {
      message.success('Coupon updated successfully')
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      navigate({ to: '/admin/coupons' })
    },
    onError: (error) => {
      console.error('Error updating coupon:', error)
      message.error('Failed to update coupon')
      setIsSubmitting(false)
    }
  })

  // Handle form submission
  const handleSubmit = useCallback(
    async (values: any) => {
      setIsSubmitting(true)
      try {
        updateCouponMutation.mutate(values)
      } catch (error) {
        console.error('Error submitting form:', error)
        message.error('Failed to update coupon')
        setIsSubmitting(false)
      }
    },
    [updateCouponMutation]
  )

  // Theme configuration
  const tableTheme = {
    components: {
      Card: {
        colorBgContainer: '#141414',
        colorBorderSecondary: '#303030',
        colorText: '#e5e7eb',
        colorTextHeading: '#e5e7eb'
      },
      Form: {
        colorText: '#e5e7eb',
        colorTextSecondary: '#9ca3af',
        colorBgContainer: '#141414',
        colorBorder: '#303030'
      },
      Input: {
        colorText: '#e5e7eb',
        colorBgContainer: '#1f1f1f',
        colorBorder: '#303030',
        colorPrimaryHover: '#3b82f6'
      },
      DatePicker: {
        colorText: '#e5e7eb',
        colorTextPlaceholder: '#6b7280',
        colorBgContainer: '#1f1f1f',
        colorBorder: '#303030',
        colorPrimaryHover: '#3b82f6'
      },
      InputNumber: {
        colorText: '#e5e7eb',
        colorBgContainer: '#1f1f1f',
        colorBorder: '#303030',
        colorPrimaryHover: '#3b82f6'
      },
      Button: {
        colorText: '#e5e7eb',
        colorPrimary: '#3b82f6',
        colorPrimaryHover: '#2563eb',
        colorBgContainer: '#1f1f1f',
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
      controlHeight: 36
    }
  }

  // Additional styling
  const additionalStyles = `
    .ant-picker {
      background-color: #1f1f1f !important;
      border-color: #303030 !important;
      color: #e5e7eb !important;
    }

    .ant-picker-input > input {
      color: #e5e7eb !important;
    }

    .ant-picker-suffix {
      color: #9ca3af !important;
    }

    .ant-picker-clear {
      background-color: #1f1f1f !important;
      color: #9ca3af !important;
    }

    .ant-form-item-label > label {
      color: #e5e7eb !important;
    }

    .ant-picker-panel {
      background-color: #1f1f1f !important;
      border-color: #303030 !important;
    }

    .ant-picker-header {
      color: #e5e7eb !important;
      border-color: #303030 !important;
    }

    .ant-picker-header button {
      color: #9ca3af !important;
    }

    .ant-picker-content th {
      color: #9ca3af !important;
    }

    .ant-picker-cell-in-view {
      color: #e5e7eb !important;
    }

    .ant-picker-cell-selected .ant-picker-cell-inner {
      background-color: #3b82f6 !important;
    }
  `

  return (
    <ConfigProvider theme={tableTheme}>
      <style>{additionalStyles}</style>
      <BreadcrumbUpdater
        items={['Admin Dashboard', 'Coupons', 'Edit Coupon']}
        previousItems={['Admin Dashboard', 'Coupons']}
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
              <div className="flex items-center gap-3">
                <Button
                  icon={<ArrowLeftOutlined />}
                  type="text"
                  onClick={() => navigate({ to: '/admin/coupons' })}
                />
                <span className="text-lg font-semibold">Edit Coupon</span>
              </div>
            </motion.div>
          }
        >
          <motion.div variants={itemVariants} className="p-6">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Spin size="large" />
              </div>
            ) : !coupon ? (
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <AlertCircle className="mb-4 size-16 text-red-500" />
                <p className="text-lg text-red-400">Coupon not found</p>
                <Button
                  onClick={() => navigate({ to: '/admin/coupons' })}
                  type="primary"
                  className="mt-4"
                >
                  Back to Coupons
                </Button>
              </div>
            ) : (
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Coupon ID (read-only) */}
                  <Form.Item label="Coupon ID">
                    <Input
                      value={coupon.id}
                      readOnly
                      className="rounded-lg bg-gray-800 text-gray-400"
                    />
                  </Form.Item>

                  {/* Coupon Code */}
                  <Form.Item
                    label="Coupon Code"
                    name="code"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter a coupon code'
                      }
                    ]}
                  >
                    <Input
                      placeholder="Enter coupon code (e.g., SUMMER20)"
                      className="rounded-lg"
                      prefix={<span className="text-blue-400">#</span>}
                    />
                  </Form.Item>

                  {/* Discount Percentage */}
                  <Form.Item
                    label="Discount (%)"
                    name="discount"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter the discount percentage'
                      }
                    ]}
                  >
                    <InputNumber
                      min={1}
                      max={100}
                      className="w-full rounded-lg"
                      placeholder="Enter discount percentage"
                      prefix={
                        <Percent className="mr-1 size-4 text-green-500" />
                      }
                    />
                  </Form.Item>

                  {/* Expiry Date */}
                  <Form.Item
                    label="Expiry Date"
                    name="expiryDate"
                    rules={[
                      {
                        required: true,
                        message: 'Please select an expiry date'
                      }
                    ]}
                  >
                    <DatePicker
                      className="w-full rounded-lg"
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="Select expiry date and time"
                    />
                  </Form.Item>

                  {/* Usage Limit */}
                  <Form.Item
                    label="Usage Limit"
                    name="usageLimit"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter the usage limit'
                      }
                    ]}
                    tooltip="How many times this coupon can be used"
                  >
                    <InputNumber
                      min={1}
                      className="w-full rounded-lg"
                      placeholder="Enter usage limit"
                      prefix={
                        <ShieldCheck className="mr-1 size-4 text-purple-500" />
                      }
                    />
                  </Form.Item>
                </div>

                <Divider className="border-gray-700" />

                {/* Actions */}
                <div className="mt-8 flex justify-end">
                  <Button
                    type="default"
                    className="mr-4"
                    onClick={() => navigate({ to: '/admin/coupons' })}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting}
                    style={{ backgroundColor: '#3b82f6' }}
                  >
                    Update Coupon
                  </Button>
                </div>
              </Form>
            )}
          </motion.div>
        </MotionCard>
      </motion.div>
    </ConfigProvider>
  )
}
