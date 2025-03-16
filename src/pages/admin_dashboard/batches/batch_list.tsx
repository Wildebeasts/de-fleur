/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import {
  Table,
  ConfigProvider,
  Button,
  Modal,
  message,
  Input,
  Card
} from 'antd'
import {
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined
} from '@ant-design/icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { BreadcrumbUpdater } from '@/components/BreadcrumbUpdater'
import { Package as LucidePackage } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

import batchApi from '@/lib/services/batchApi'
import cosmeticApi from '@/lib/services/cosmeticApi'
import { BatchResponse } from '@/lib/types/Batch'

interface BatchWithDetails extends BatchResponse {
  key: string
  cosmeticName?: string
}

export default function BatchList() {
  const [searchText, setSearchText] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const navigate = useNavigate()

  // Fetch batches data
  const { data: batchesData, isLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      const response = await batchApi.getBatches()
      if (response.data.isSuccess) {
        // Extract just the batch data array
        const batches = response.data.data || []

        // Transform into the format we need
        const batchesWithDetails = await Promise.all(
          batches.map(async (batch) => {
            try {
              // Cast to access the properties we need
              const batchData = batch as unknown as BatchResponse
              const cosmeticResponse = await cosmeticApi.getCosmeticById(
                batchData.cosmeticId
              )
              return {
                ...batchData,
                key: batchData.id,
                cosmeticName: cosmeticResponse?.data?.data?.name || 'Unknown'
              } as BatchWithDetails
            } catch (error) {
              // Cast to access the properties we need
              const batchData = batch as unknown as BatchResponse
              return {
                ...batchData,
                key: batchData.id,
                cosmeticName: 'Unknown'
              } as BatchWithDetails
            }
          })
        )
        return batchesWithDetails
      }
      throw new Error('Failed to fetch batches')
    }
  })

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    return (batchesData || []).filter((item) =>
      Object.values(item).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    )
  }, [batchesData, searchText])

  // Table columns configuration
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => text.substring(0, 8) + '...'
    },
    {
      title: 'Cosmetic',
      dataIndex: 'cosmeticName',
      key: 'cosmeticName'
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a: BatchWithDetails, b: BatchWithDetails) =>
        a.quantity - b.quantity
    },
    {
      title: 'Exported Date',
      dataIndex: 'exportedDate',
      key: 'exportedDate',
      render: (date: string) => format(new Date(date), 'dd/MM/yyyy')
    },
    {
      title: 'Manufacture Date',
      dataIndex: 'manufactureDate',
      key: 'manufactureDate',
      render: (date: string) => format(new Date(date), 'dd/MM/yyyy')
    },
    {
      title: 'Expiration Date',
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      render: (date: string) => format(new Date(date), 'dd/MM/yyyy')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: BatchWithDetails) => (
        <div className="flex items-center">
          <Button
            type="text"
            className="flex size-9 items-center justify-center rounded-full text-blue-500 transition-all hover:bg-blue-500/10 hover:text-blue-600"
            onClick={() => navigate({ to: `/admin/batches/${record.id}/edit` })}
            icon={<EditOutlined className="text-lg" />}
          />
        </div>
      )
    }
  ]

  // Handle batch deletion
  const handleDelete = (record: BatchWithDetails) => {
    Modal.confirm({
      title: 'Delete Batch',
      content: 'Are you sure you want to delete this batch?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await batchApi.deleteBatch(record.id)
          message.success('Batch deleted successfully')
          queryClient.invalidateQueries({ queryKey: ['batches'] })
        } catch (error) {
          console.error('Error deleting batch:', error)
          message.error('Failed to delete batch')
        }
      }
    })
  }

  // Handle bulk delete
  const handleBulkDelete = () => {
    Modal.confirm({
      title: 'Delete Selected Batches',
      content: 'Are you sure you want to delete the selected batches?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await Promise.all(
            selectedRowKeys.map((key) => batchApi.deleteBatch(key.toString()))
          )
          message.success('Batches deleted successfully')
          setSelectedRowKeys([])
          queryClient.invalidateQueries({ queryKey: ['batches'] })
        } catch (error) {
          console.error('Error deleting batches:', error)
          message.error('Failed to delete batches')
        }
      }
    })
  }

  // Table theme configuration
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
        colorSplit: '#303030',
        colorBgTextHover: 'rgba(30, 41, 59, 0.4)',
        colorBgTextActive: 'rgba(34, 197, 94, 0.08)',
        colorBgTextSelectedHover: 'rgba(34, 197, 94, 0.12)'
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
      Select: {
        colorText: '#e5e7eb',
        colorBgContainer: '#1f1f1f',
        colorBorder: '#303030',
        colorPrimaryHover: '#3b82f6',
        colorBgElevated: '#1f1f1f',
        colorTextPlaceholder: '#6b7280'
      },
      Tag: {
        colorText: '#e5e7eb'
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
    visible: {
      opacity: 1,
      y: 0
    }
  }

  // Update the additional styles section to include proper checkbox styling and more subtle hues
  const additionalStyles = `
    /* Make selected rows have a more subtle green background */
    .ant-table-row.ant-table-row-selected > td {
      background-color: rgba(34, 197, 94, 0.08) !important;
      transition: background-color 0.3s ease;
    }

    .ant-table-row:hover > td {
      background-color: rgba(30, 41, 59, 0.4) !important;
    }

    .ant-table-row.ant-table-row-selected:hover > td {
      background-color: rgba(34, 197, 94, 0.12) !important;
    }

    /* Style for the checkboxes - make them green */
    .ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner,
    .ant-table-thead .ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner,
    .ant-table-tbody .ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner {
      background-color: rgba(34, 197, 94, 0.7) !important;
      border-color: #22c55e !important;
    }
    
    /* Style for indeterminate checkboxes */
    .ant-checkbox-indeterminate .ant-checkbox-inner {
      background-color: rgba(34, 197, 94, 0.3) !important;
      border-color: #22c55e !important;
    }
    
    /* Make checkbox borders more visible in unchecked state */
    .ant-checkbox-wrapper .ant-checkbox-inner {
      border-color: rgba(34, 197, 94, 0.5) !important;
    }
    
    /* Checkbox hover effect */
    .ant-checkbox-wrapper:hover .ant-checkbox-inner {
      border-color: #22c55e !important;
    }
    
    /* Remove the highlight effect on the header row - it's too bright */
    .ant-table-thead > tr > th:first-child::after {
      display: none;
    }

    /* Style for action buttons */
    .ant-btn-dangerous.ant-btn-primary {
      background-color: #ef4444 !important;
      border-color: #ef4444 !important;
    }

    .ant-btn-dangerous.ant-btn-primary:hover {
      background-color: #dc2626 !important;
      border-color: #dc2626 !important;
    }

    /* Make header checkbox (select all) less bright */
    .ant-table-thead .ant-checkbox-wrapper .ant-checkbox-inner {
      border-color: rgba(34, 197, 94, 0.3) !important;
      background-color: transparent !important;
    }

    .ant-table-thead .ant-checkbox-wrapper:hover .ant-checkbox-inner {
      border-color: rgba(34, 197, 94, 0.5) !important;
    }

    .ant-table-thead .ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner {
      background-color: rgba(34, 197, 94, 0.5) !important;
      border-color: rgba(34, 197, 94, 0.4) !important;
    }

    .ant-table-thead .ant-checkbox-wrapper .ant-checkbox-indeterminate .ant-checkbox-inner {
      background-color: rgba(34, 197, 94, 0.2) !important;
      border-color: rgba(34, 197, 94, 0.4) !important;
    }

    /* Checkbox checkmark color */
    .ant-checkbox-checked .ant-checkbox-inner::after {
      border-color: rgba(255, 255, 255, 0.9) !important;
    }
  `

  return (
    <ConfigProvider theme={tableTheme}>
      <style>{additionalStyles}</style>
      <BreadcrumbUpdater
        items={['Admin Dashboard', 'Batches', 'All Batches']}
        previousItems={['Admin Dashboard']}
      />
      <motion.div
        className="mx-auto mt-8 w-4/5"
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
              Batches
            </motion.h1>
            <motion.p className="text-gray-400" variants={itemVariants}>
              Manage all product batches
            </motion.p>
          </div>
        </div>

        <motion.div variants={itemVariants}>
          <Card
            className="rounded-xl border border-gray-100/10 bg-[#1a1b24]"
            title={
              <div className="my-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#282d35] p-2">
                    <LucidePackage className="size-5 text-blue-400" />
                  </div>
                  <span className="text-lg font-semibold text-white">
                    All Batches
                  </span>
                </div>
                <div className="flex space-x-2">
                  {selectedRowKeys.length > 0 && (
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleBulkDelete}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete Selected ({selectedRowKeys.length})
                    </Button>
                  )}
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate({ to: '/admin/batches/create' })}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Create Batch
                  </Button>
                </div>
              </div>
            }
          >
            <motion.div variants={itemVariants} className="mb-6">
              <Input
                placeholder="Search batches..."
                prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-64"
              />
            </motion.div>

            <Table
              columns={columns}
              dataSource={filteredData}
              loading={isLoading}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys
              }}
              pagination={{
                pageSize: pageSize,
                current: currentPage,
                onChange: (page, pageSize) => {
                  setCurrentPage(page)
                  setPageSize(pageSize || 10)
                },
                showSizeChanger: true
              }}
            />
          </Card>
        </motion.div>
      </motion.div>
    </ConfigProvider>
  )
}
