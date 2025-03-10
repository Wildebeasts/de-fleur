import React, { useState, useCallback } from 'react'
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
  Divider
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { BreadcrumbUpdater } from '@/components/BreadcrumbUpdater'
import couponApi from '@/lib/services/couponApi'
import { Percent, ShieldCheck } from 'lucide-react'
import dayjs from 'dayjs'
import { CouponCreateRequest } from '@/lib/types/Coupon'

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

export default function CreateCoupon() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Create coupon mutation
  const createCouponMutation = useMutation({
    mutationFn: (values: any) => {
      console.log('Submitting coupon data:', values) // Debug log

      const couponCreate: CouponCreateRequest = {
        name: '',
        code: values.code,
        discount: values.discount,
        expiryDate: values.expiryDate.toISOString(),
        usageLimit: values.usageLimit
      }

      // Ensure correct data format for API
      return couponApi.createCoupon(couponCreate)
    },
    onSuccess: (data) => {
      console.log('Coupon created successfully:', data) // Debug log
      message.success('Coupon created successfully')
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      navigate({ to: '/admin/coupons' })
    },
    onError: (error) => {
      console.error('Error creating coupon:', error)
      message.error('Failed to create coupon')
      setIsSubmitting(false)
    }
  })

  // Handle form submission
  const handleSubmit = useCallback(
    async (values: any) => {
      setIsSubmitting(true)
      try {
        createCouponMutation.mutate(values)
      } catch (error) {
        console.error('Error submitting form:', error)
        message.error('Failed to create coupon')
        setIsSubmitting(false)
      }
    },
    [createCouponMutation]
  )

  // Theme configuration to match existing admin pages
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

    .ant-picker-panel-container {
      background-color: #1f1f1f !important;
    }

    .ant-picker-panel {
      border-color: #303030 !important;
    }

    .ant-picker-header {
      color: #e5e7eb !important;
      border-color: #303030 !important;
    }

    .ant-picker-header button {
      color: #9ca3af !important;
    }

    .ant-picker-cell {
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
        items={['Admin Dashboard', 'Coupons', 'Create Coupon']}
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
                <span className="text-lg font-semibold">Create New Coupon</span>
              </div>
            </motion.div>
          }
        >
          <motion.div variants={itemVariants} className="p-6">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                discount: 10,
                usageLimit: 1,
                expiryDate: dayjs().add(30, 'day')
              }}
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    prefix={<Percent className="mr-1 size-4 text-green-500" />}
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
                  Create Coupon
                </Button>
              </div>
            </Form>
          </motion.div>
        </MotionCard>
      </motion.div>
    </ConfigProvider>
  )
}
