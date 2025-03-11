/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Form,
  Select,
  Button,
  Card,
  ConfigProvider,
  message,
  DatePicker,
  Divider
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { BreadcrumbUpdater } from '@/components/BreadcrumbUpdater'
import reportApi from '@/lib/services/ReportService'
import { FileEdit } from 'lucide-react'
import dayjs from 'dayjs'

const { Option } = Select

// Format options
const formatOptions = [{ value: 'pdf', label: 'PDF' }]

// Report type options
const typeOptions = [
  { value: 'revenue', label: 'Revenue Report' },
  { value: 'productPerformance', label: 'Product Performance' }
]

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

export default function CreateReport() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Format RFC 3339 date string (2017-07-21T17:32:28Z)
  const formatDateToRFC3339 = (date: dayjs.Dayjs | null): string => {
    if (!date) return ''
    return date.toISOString()
  }

  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: (values: any) => {
      const fromDate = formatDateToRFC3339(values.fromDate)
      const toDate = formatDateToRFC3339(values.toDate)

      return reportApi.createReport({
        fromDate,
        toDate,
        format: values.format,
        type: values.type
      })
    },
    onSuccess: () => {
      message.success('Report created successfully')
      navigate({ to: '/admin/reports' })
    },
    onError: (error) => {
      console.error('Error creating report:', error)
      message.error('Failed to create report')
      setIsSubmitting(false)
    }
  })

  // Handle form submission
  const handleSubmit = useCallback(
    async (values: any) => {
      setIsSubmitting(true)
      try {
        createReportMutation.mutate(values)
      } catch (error) {
        console.error('Error submitting form:', error)
        message.error('Failed to create report')
        setIsSubmitting(false)
      }
    },
    [createReportMutation]
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
        colorTextDisabled: '#6b7280'
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

    .ant-select-selection-placeholder {
      color: #6b7280 !important;
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

    .ant-select-dropdown {
      background-color: #1f1f1f !important;
      border: 1px solid #303030 !important;
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

    .ant-picker-time-panel-column > li.ant-picker-time-panel-cell-selected .ant-picker-time-panel-cell-inner {
      background-color: #3b82f620 !important;
    }
  `

  return (
    <ConfigProvider theme={tableTheme}>
      <style>{additionalStyles}</style>
      <BreadcrumbUpdater
        items={['Admin Dashboard', 'Issue Tickets', 'Create Report']}
        previousItems={['Admin Dashboard', 'Issue Tickets', 'Reports']}
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
                  onClick={() => navigate({ to: '/admin/reports' })}
                />
                <span className="text-lg font-semibold">Create New Report</span>
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
                format: 'pdf',
                type: 'revenue'
              }}
            >
              <div className="grid grid-cols-1 gap-6">
                {/* From Date */}
                <Form.Item
                  label="From Date"
                  name="fromDate"
                  rules={[
                    {
                      required: true,
                      message: 'Please select a start date'
                    }
                  ]}
                  tooltip="Date in RFC 3339 format, e.g., 2017-07-21T17:32:28Z"
                >
                  <DatePicker
                    className="w-full rounded-lg"
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="Select start date and time"
                  />
                </Form.Item>

                {/* To Date */}
                <Form.Item
                  label="To Date"
                  name="toDate"
                  rules={[
                    {
                      required: true,
                      message: 'Please select an end date'
                    }
                  ]}
                  tooltip="Date in RFC 3339 format, e.g., 2017-07-21T17:32:28Z"
                >
                  <DatePicker
                    className="w-full rounded-lg"
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="Select end date and time"
                  />
                </Form.Item>

                {/* Format */}
                <Form.Item
                  label="Format"
                  name="format"
                  rules={[
                    {
                      required: true,
                      message: 'Please select a format'
                    }
                  ]}
                >
                  <Select placeholder="Select format" className="rounded-lg">
                    {formatOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Report Type */}
                <Form.Item
                  label="Report Type"
                  name="type"
                  rules={[
                    {
                      required: true,
                      message: 'Please select a report type'
                    }
                  ]}
                >
                  <Select
                    placeholder="Select report type"
                    className="rounded-lg"
                  >
                    {typeOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <Divider className="border-gray-700" />

              {/* Actions */}
              <div className="mt-8 flex justify-end">
                <Button
                  type="default"
                  className="mr-4"
                  onClick={() => navigate({ to: '/admin/reports' })}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  style={{ backgroundColor: '#3b82f6' }}
                  icon={<FileEdit className="mr-1 size-4" />}
                >
                  Generate Report
                </Button>
              </div>
            </Form>
          </motion.div>
        </MotionCard>
      </motion.div>
    </ConfigProvider>
  )
}
