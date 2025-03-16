/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Button,
  Card,
  ConfigProvider,
  message,
  Divider
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { BreadcrumbUpdater } from '@/components/BreadcrumbUpdater'
import batchApi from '@/lib/services/batchApi'
import cosmeticApi from '@/lib/services/cosmeticApi'
import { Package as LucidePackage } from 'lucide-react'
import dayjs from 'dayjs'

const { Option } = Select

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

export default function CreateBatch() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch all cosmetics for dropdown by setting a large page size
  const { data: cosmeticsData, isLoading: isLoadingCosmetics } = useQuery({
    queryKey: ['cosmetics-for-dropdown'],
    queryFn: async () => {
      // Use page size 1000 to get all items at once for the dropdown
      const response = await cosmeticApi.getCosmetics(
        1, // first page
        1000, // large page size to get all items
        'name', // sort by name
        'asc', // ascending order
        '' // no search filter
      )
      if (response.data.isSuccess) {
        return response.data.data || { items: [] }
      }
      return { items: [] }
    }
  })

  // Use the items array directly for mapping
  const cosmetics = cosmeticsData?.items || []

  // Create batch mutation
  const createBatchMutation = useMutation({
    mutationFn: (values: any) => batchApi.createBatch(values),
    onSuccess: () => {
      message.success('Batch created successfully')
      queryClient.invalidateQueries({ queryKey: ['batches'] })
      navigate({ to: '/admin/batches' })
    },
    onError: (error) => {
      console.error('Error creating batch:', error)
      message.error('Failed to create batch')
      setIsSubmitting(false)
    }
  })

  // Handle form submission
  const onFinish = async (values: any) => {
    setIsSubmitting(true)
    try {
      // Format dates to match API requirements
      const batchData = {
        cosmeticId: values.cosmeticId,
        quantity: values.quantity,
        manufactureDate: dayjs(values.manufactureDate).format('YYYY-MM-DD'),
        expirationDate: dayjs(values.expirationDate).format('YYYY-MM-DD')
      }

      // Submit to API
      createBatchMutation.mutate(batchData)
    } catch (error) {
      console.error('Error submitting form:', error)
      message.error('Failed to create batch')
      setIsSubmitting(false)
    }
  }

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
      InputNumber: {
        colorText: '#e5e7eb',
        colorBgContainer: '#1f1f1f',
        colorBorder: '#303030'
      },
      Select: {
        colorText: '#e5e7eb',
        colorBgContainer: '#1f1f1f',
        colorBorder: '#303030',
        colorPrimaryHover: '#3b82f6',
        colorTextPlaceholder: '#6b7280',
        optionSelectedBg: '#3b82f620'
      },
      Button: {
        colorText: '#e5e7eb',
        colorPrimary: '#3b82f6',
        colorPrimaryHover: '#2563eb',
        colorBgContainer: '#1f1f1f',
        colorBorder: '#303030'
      },
      DatePicker: {
        colorText: '#e5e7eb',
        colorTextPlaceholder: '#6b7280',
        colorBgContainer: '#1f1f1f',
        colorBorder: '#303030',
        colorPrimaryHover: '#3b82f6',
        colorBgElevated: '#1f1f1f'
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

  // Additional styles for components that need extra customization
  const additionalStyles = `
    .ant-select-dropdown {
      background-color: #1f1f1f !important;
      border: 1px solid #303030 !important;
    }

    .ant-select-item {
      color: #e5e7eb !important;
      background-color: #1f1f1f !important;
    }

    .ant-select-item-option-selected {
      background-color: #3b82f620 !important;
    }

    .ant-select-item-option-active {
      background-color: #1f2937 !important;
    }

    .ant-picker-dropdown {
      background-color: #1f1f1f !important;
      border: 1px solid #303030 !important;
    }

    .ant-picker-content th,
    .ant-picker-content td {
      color: #e5e7eb !important;
    }

    .ant-picker-header-view {
      color: #e5e7eb !important;
    }

    .ant-picker-header button {
      color: #9ca3af !important;
    }

    .ant-picker-cell-in-view {
      color: #e5e7eb !important;
    }

    .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner {
      background-color: #3b82f6 !important;
    }

    .ant-form-item-label > label {
      color: #e5e7eb !important;
    }
  `

  return (
    <ConfigProvider theme={tableTheme}>
      <style>{additionalStyles}</style>
      <BreadcrumbUpdater
        items={['Admin Dashboard', 'Batches', 'Create Batch']}
        previousItems={['Admin Dashboard', 'Batches']}
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
                  onClick={() => navigate({ to: '/admin/batches' })}
                />
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#282d35] p-2">
                    <LucidePackage className="size-5 text-blue-400" />
                  </div>
                  <span className="text-lg font-semibold">
                    Create New Batch
                  </span>
                </div>
              </div>
            </motion.div>
          }
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                quantity: 1
              }}
            >
              <Divider orientation="left" className="text-gray-400">
                Batch Information
              </Divider>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Cosmetic Selection */}
                <Form.Item
                  label="Cosmetic"
                  name="cosmeticId"
                  rules={[
                    { required: true, message: 'Please select a cosmetic' }
                  ]}
                >
                  <Select
                    placeholder="Select cosmetic"
                    loading={isLoadingCosmetics}
                    showSearch
                    optionFilterProp="children"
                  >
                    {cosmetics.map((cosmetic: any) => (
                      <Option key={cosmetic.id} value={cosmetic.id}>
                        {cosmetic.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Quantity */}
                <Form.Item
                  label="Quantity"
                  name="quantity"
                  rules={[
                    { required: true, message: 'Please enter batch quantity' },
                    {
                      type: 'number',
                      min: 1,
                      message: 'Quantity must be at least 1'
                    }
                  ]}
                >
                  <InputNumber min={1} className="w-full" />
                </Form.Item>
              </div>

              <Divider orientation="left" className="text-gray-400">
                Dates
              </Divider>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Manufacture Date */}
                <Form.Item
                  label="Manufacture Date"
                  name="manufactureDate"
                  rules={[
                    {
                      required: true,
                      message: 'Please select manufacture date'
                    },
                    {
                      validator: (_, value) => {
                        if (value && !dayjs(value).isValid()) {
                          return Promise.reject('Please enter a valid date')
                        }

                        if (value && dayjs(value).isAfter(dayjs())) {
                          return Promise.reject(
                            'Manufacture date cannot be in the future'
                          )
                        }

                        return Promise.resolve()
                      }
                    }
                  ]}
                >
                  <DatePicker className="w-full" format="YYYY-MM-DD" />
                </Form.Item>

                {/* Expiration Date */}
                <Form.Item
                  label="Expiration Date"
                  name="expirationDate"
                  rules={[
                    {
                      required: true,
                      message: 'Please select expiration date'
                    },
                    {
                      validator: (_, value) => {
                        if (value && !dayjs(value).isValid()) {
                          return Promise.reject('Please enter a valid date')
                        }

                        const manufactureDate =
                          form.getFieldValue('manufactureDate')
                        if (value && manufactureDate) {
                          if (value.isBefore(manufactureDate)) {
                            return Promise.reject(
                              'Expiration date must be after manufacture date'
                            )
                          }

                          // Check if expiration date is at least 30 days after manufacture date
                          const minExpiryDate = dayjs(manufactureDate).add(
                            30,
                            'day'
                          )
                          if (value.isBefore(minExpiryDate)) {
                            return Promise.reject(
                              'Expiration date must be at least 30 days after manufacture date'
                            )
                          }
                        }

                        return Promise.resolve()
                      }
                    }
                  ]}
                >
                  <DatePicker className="w-full" format="YYYY-MM-DD" />
                </Form.Item>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  type="default"
                  className="mr-4"
                  onClick={() => navigate({ to: '/admin/batches' })}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  style={{ backgroundColor: '#3b82f6' }}
                  icon={<LucidePackage className="mr-1 size-4" />}
                >
                  Create Batch
                </Button>
              </div>
            </Form>
          </motion.div>
        </MotionCard>
      </motion.div>
    </ConfigProvider>
  )
}
