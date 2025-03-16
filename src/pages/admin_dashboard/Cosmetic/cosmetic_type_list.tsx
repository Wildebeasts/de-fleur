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
import { Input } from 'antd'
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
import cosmeticTypeApi from '@/lib/services/cosmeticTypeApi'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'

interface CosmeticTypeDto {
  id: string
  name: string
  description: string
  key: string
}

interface DataType extends CosmeticTypeDto {
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

export default function CosmeticTypes() {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const queryClient = useQueryClient()

  // Fetch cosmetic types using React Query
  const { data: cosmeticTypes = [], isLoading: isLoadingTypes } = useQuery({
    queryKey: ['cosmeticTypes'],
    queryFn: async () => {
      const response = await cosmeticTypeApi.getCosmeticTypes()
      return (response.data?.data ?? []).map((type) => ({
        ...type,
        key: type.id
      }))
    }
  })

  // Filter data based on search
  const filteredData = useMemo(() => {
    return cosmeticTypes.filter((item) =>
      Object.values(item).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    )
  }, [cosmeticTypes, searchText])

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
        // @ts-expect-error -- cosmeticTypeId is not defined in the params
        to: '/admin/cosmetic-types/$typeId/edit',
        // @ts-expect-error -- cosmeticTypeId is not defined in the params
        params: { typeId: record.id }
      })
    },
    [navigate]
  )

  const handleDelete = useCallback(
    (record: DataType) => {
      Modal.confirm({
        title: 'Are you sure you want to delete this cosmetic type?',
        content: 'This action cannot be undone.',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          try {
            await cosmeticTypeApi.deleteCosmeticType(record.id)
            message.success('Cosmetic type deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['cosmeticTypes'] })
          } catch (error) {
            console.error('Error deleting cosmetic type:', error)
            message.error('Failed to delete cosmetic type')
          }
        }
      })
    },
    [queryClient]
  )

  // Reference existing theme configuration
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

  return (
    <ConfigProvider theme={tableTheme}>
      <BreadcrumbUpdater
        items={['Admin Dashboard', 'Cosmetics', 'Cosmetic Types']}
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
              <span className="text-lg font-semibold">Cosmetic Types</span>
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Input
                    prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                    placeholder="Search cosmetic types..."
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
                    onClick={() =>
                      // @ts-expect-error -- cosmeticTypeId is not defined in the params
                      navigate({ to: '/admin/cosmetic-types/add' })
                    }
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
            <Table
              columns={columns}
              dataSource={filteredData}
              loading={isLoadingTypes}
              pagination={{
                pageSize: 10,
                showSizeChanger: false
              }}
            />
          </motion.div>
        </MotionCard>
      </motion.div>
    </ConfigProvider>
  )
}
