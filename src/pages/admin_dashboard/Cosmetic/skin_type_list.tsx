import { useState, useCallback, useMemo, useRef } from 'react'
import {
  Table,
  ConfigProvider,
  Dropdown,
  Button,
  Modal,
  message,
  Card
} from 'antd'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import 'antd/dist/reset.css'
import {
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { Input } from 'antd'
import { useNavigate } from '@tanstack/react-router'
import React from 'react'
import { BreadcrumbUpdater } from '@/components/BreadcrumbUpdater'
import skinTypeApi from '@/lib/services/skinTypeApi'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'

interface SkinTypeDto {
  id: string
  name: string
  description: string
  isDry: boolean
  isSensitive: boolean
  isUneven: boolean
  isWrinkle: boolean
}

interface DataType extends SkinTypeDto {
  key: string
}

// Reuse the HighlightText component from the original file
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

const MotionCard = motion(Card)

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

export default function SkinTypes() {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const queryClient = useQueryClient()

  // Fetch skin types using React Query
  const { data: skinTypes = [], isLoading } = useQuery({
    queryKey: ['skinTypes'],
    queryFn: async () => {
      const response = await skinTypeApi.getSkinTypes()
      return (response.data?.data ?? []).map((item: SkinTypeDto) => ({
        ...item,
        key: item.id
      }))
    }
  })

  // Filter data based on search
  const filteredData = useMemo(() => {
    return skinTypes.filter((item) =>
      Object.values(item).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    )
  }, [skinTypes, searchText])

  // Add search handler
  const handleGlobalSearch = useCallback((value: string) => {
    setSearchText(value)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      // Search is handled by filteredData memo
    }, 300)
  }, [])

  // Define handlers
  const handleEdit = useCallback(
    (record: DataType) => {
      navigate({
        // @ts-expect-error -- skinTypeId is not defined in the params
        to: '/admin/skin-types/$skinTypeId/edit',
        // @ts-expect-error -- skinTypeId is not defined in the params
        params: { skinTypeId: record.id }
      })
    },
    [navigate]
  )

  const handleDelete = useCallback(
    (record: DataType) => {
      Modal.confirm({
        title: 'Are you sure you want to delete this skin type?',
        content: 'This action cannot be undone.',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          try {
            await skinTypeApi.deleteSkinType(record.id)
            message.success('Skin type deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['skinTypes'] })
          } catch (error) {
            console.error('Error deleting skin type:', error)
            message.error('Failed to delete skin type')
          }
        }
      })
    },
    [queryClient]
  )

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
        // Updated selection colors
        selectionColumnWidth: 48,
        selectionBg: 'rgba(74, 222, 128, 0.08)', // Light neon green with low opacity
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

  // Define columns
  const columns = useMemo(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text: string) => (
          <MemoizedHighlightText text={text} searchText={searchText} />
        )
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        render: (text: string) => (
          <MemoizedHighlightText text={text} searchText={searchText} />
        )
      },
      {
        title: 'Properties',
        key: 'properties',
        render: (_: unknown, record: DataType) => (
          <div className="flex gap-2">
            {record.isDry && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400 ring-1 ring-inset ring-amber-500/20"
              >
                Dry
              </motion.span>
            )}
            {record.isSensitive && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center rounded-md bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/20"
              >
                Sensitive
              </motion.span>
            )}
            {record.isUneven && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center rounded-md bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-400 ring-1 ring-inset ring-yellow-500/20"
              >
                Uneven
              </motion.span>
            )}
            {record.isWrinkle && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-400 ring-1 ring-inset ring-purple-500/20"
              >
                Wrinkle
              </motion.span>
            )}
          </div>
        )
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 80,
        render: (_: unknown, record: DataType) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'edit',
                  icon: <EditOutlined />,
                  label: 'Edit',
                  onClick: () => handleEdit(record)
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
    [searchText, handleEdit, handleDelete]
  )

  // Table configuration
  const tableConfig = useMemo(
    () => ({
      columns,
      dataSource: filteredData,
      loading: isLoading,
      rowSelection: {
        type: 'checkbox' as const,
        selectedRowKeys,
        onChange: setSelectedRowKeys,
        columnTitle: '',
        columnWidth: 48,
        hideSelectAll: true
      },
      pagination: {
        pageSize: 10,
        showSizeChanger: false
      },
      scroll: { y: 600 },
      size: 'middle' as const
    }),
    [columns, filteredData, isLoading, selectedRowKeys]
  )

  return (
    <ConfigProvider theme={tableTheme}>
      <BreadcrumbUpdater
        items={['Admin Dashboard', 'Cosmetics', 'Skin Types']}
        previousItems={['Admin Dashboard', 'Cosmetics']}
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
              <span className="text-lg font-semibold">Skin Types</span>
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Input
                    prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                    placeholder="Search skin types..."
                    value={searchText}
                    onChange={(e) => handleGlobalSearch(e.target.value)}
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
                    // @ts-expect-error -- skinTypeId is not defined in the params
                    onClick={() => navigate({ to: '/admin/skin-types/add' })}
                  >
                    Add New
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
            <Table {...tableConfig} />
          </motion.div>
        </MotionCard>
      </motion.div>
    </ConfigProvider>
  )
}
