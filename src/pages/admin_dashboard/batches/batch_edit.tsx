import React, { useState, useEffect } from 'react'
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
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { BreadcrumbUpdater } from '@/components/BreadcrumbUpdater'
import batchApi from '@/lib/services/batchApi'
import cosmeticApi from '@/lib/services/cosmeticApi'
import { Package as LucidePackage } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import localeData from 'dayjs/plugin/localeData'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import { Route as BatchEditRoute } from '@/routes/admin/batches/$batchId/edit'

// Register the plugins
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(weekOfYear)
dayjs.extend(advancedFormat)

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

export default function EditBatch() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { batchId } = BatchEditRoute.useParams()
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch batch data
  const { data: batchData, isLoading: isLoadingBatch } = useQuery({
    queryKey: ['batch', batchId],
    queryFn: async () => {
      const response = await batchApi.getBatchById(batchId)
      if (response.data.isSuccess && response.data.data) {
        // If data is an array, get the first item, otherwise use it directly
        return Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data
      }
      throw new Error('Failed to fetch batch')
    },
    enabled: !!batchId
  })

  // Fetch cosmetic data
  const { data: cosmeticData, isLoading: isLoadingCosmetic } = useQuery({
    queryKey: ['cosmetic', batchData?.cosmeticId],
    queryFn: async () => {
      const response = await cosmeticApi.getCosmeticById(
        batchData?.cosmeticId || ''
      )
      return response.data.data
    },
    enabled: !!batchData?.cosmeticId
  })

  // Set form values when batch data is loaded
  useEffect(() => {
    if (batchData) {
      form.setFieldsValue({
        quantity: batchData.quantity,
        exportedDate: dayjs(batchData.exportedDate)
      })
    }
  }, [batchData, form])

  // Update batch mutation
  const updateBatchMutation = useMutation({
    mutationFn: (values: { quantity: number; exportedDate: Dayjs }) => {
      return batchApi.updateBatch(batchId, {
        quantity: values.quantity,
        exportedDate: dayjs(values.exportedDate).format('YYYY-MM-DD')
      })
    },
    onSuccess: () => {
      message.success('Batch updated successfully')
      queryClient.invalidateQueries({ queryKey: ['batches'] })
      queryClient.invalidateQueries({ queryKey: ['batch', batchId] })
      navigate({ to: '/admin/batches' })
    },
    onError: (error) => {
      console.error('Error updating batch:', error)
      message.error('Failed to update batch')
      setIsSubmitting(false)
    }
  })
  // Handle form submission
  const onFinish = async (values: {
    quantity: number
    exportedDate: Dayjs
  }) => {
    setIsSubmitting(true)
    try {
      updateBatchMutation.mutate(values)
    } catch (error) {
      console.error('Error updating batch:', error)
      message.error('Failed to update batch')
      setIsSubmitting(false)
    }
  }

  // Theme configuration for dark mode
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
        colorPrimaryHover: '#3b82f6',
        colorTextDisabled: '#9ca3af'
      },
      InputNumber: {
        colorText: '#e5e7eb',
        colorBgContainer: '#1f1f1f',
        colorBorder: '#303030',
        colorTextDisabled: '#9ca3af'
      },
      Select: {
        colorText: '#e5e7eb',
        colorBgContainer: '#1f1f1f',
        colorBorder: '#303030',
        colorPrimaryHover: '#3b82f6',
        colorTextPlaceholder: '#6b7280',
        optionSelectedBg: '#3b82f620'
      },
      DatePicker: {
        colorText: '#e5e7eb',
        colorBgContainer: '#1f1f1f',
        colorBorder: '#303030',
        colorPrimaryHover: '#3b82f6',
        colorTextPlaceholder: '#6b7280',
        colorTextDisabled: '#9ca3af'
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

  // Add some additional styles for date picker
  const additionalStyles = `
    .ant-picker-dropdown {
      background-color: #1f1f1f !important;
    }
    .ant-picker-panel-container {
      background-color: #1f1f1f !important;
      color: #e5e7eb !important;
    }
    .ant-picker-header {
      color: #e5e7eb !important;
      border-bottom-color: #303030 !important;
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
    .ant-picker-header-view button {
      color: #e5e7eb !important;
    }
    .ant-picker-footer {
      border-top-color: #303030 !important;
    }
    /* Add these styles for disabled inputs */
    .ant-input[disabled], 
    .ant-input-number-input[disabled], 
    .ant-picker-input > input[disabled] {
      color: #9ca3af !important;
    }
    
    .ant-picker-disabled .ant-picker-input > input {
      color: #9ca3af !important;
    }
  `

  if (isLoadingBatch || isLoadingCosmetic) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <ConfigProvider theme={tableTheme}>
      <style>{additionalStyles}</style>
      <BreadcrumbUpdater
        items={['Admin Dashboard', 'Batches', 'Edit Batch']}
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
                <span className="text-lg font-semibold">
                  Edit Batch: {cosmeticData?.name || 'Loading...'}
                </span>
              </div>
            </motion.div>
          }
        >
          <motion.div variants={itemVariants}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              className="p-2"
            >
              <Divider orientation="left" className="text-gray-400">
                Batch Details
              </Divider>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Cosmetic (read-only) */}
                <Form.Item label="Cosmetic">
                  <Input
                    value={cosmeticData?.name}
                    disabled
                    className="bg-gray-800 text-gray-300"
                  />
                </Form.Item>

                {/* Quantity (editable) */}
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
                {/* Exported Date (editable) */}
                <Form.Item
                  label="Exported Date"
                  name="exportedDate"
                  rules={[
                    {
                      required: true,
                      message: 'Please select exported date'
                    }
                  ]}
                >
                  <DatePicker className="w-full" format="YYYY-MM-DD" />
                </Form.Item>

                {/* Manufacture Date (read-only) */}
                <Form.Item label="Manufacture Date">
                  <DatePicker
                    value={dayjs(batchData?.manufactureDate)}
                    disabled
                    className="w-full bg-gray-800 text-gray-300"
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Expiration Date (read-only) */}
                <Form.Item label="Expiration Date">
                  <DatePicker
                    value={dayjs(batchData?.expirationDate)}
                    disabled
                    className="w-full bg-gray-800 text-gray-300"
                    format="YYYY-MM-DD"
                  />
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
                  Update Batch
                </Button>
              </div>
            </Form>
          </motion.div>
        </MotionCard>
      </motion.div>
    </ConfigProvider>
  )
}
