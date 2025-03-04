import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
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
import blogApi from '@/lib/services/blogApi'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BlogResponse } from '@/lib/types/Blog'
import {
  BeakerIcon,
  ShieldExclamationIcon,
  AcademicCapIcon,
  ClockIcon,
  LightBulbIcon,
  TagIcon
} from '@heroicons/react/24/outline'

interface DataType extends BlogResponse {
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

// Define tag colors and icons
const tagConfig = {
  'Ingredient Guide': {
    color: 'bg-emerald-500/10 text-emerald-500',
    icon: <BeakerIcon className="size-3" />
  },
  'Skin Concerns': {
    color: 'bg-purple-500/10 text-purple-500',
    icon: <ShieldExclamationIcon className="size-3" />
  },
  'Skincare Education': {
    color: 'bg-blue-500/10 text-blue-500',
    icon: <AcademicCapIcon className="size-3" />
  },
  'Routine Building': {
    color: 'bg-amber-500/10 text-amber-500',
    icon: <ClockIcon className="size-3" />
  },
  'Expert Advice': {
    color: 'bg-rose-500/10 text-rose-500',
    icon: <LightBulbIcon className="size-3" />
  }
} as const

type TagType = keyof typeof tagConfig

export default function BlogList() {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const queryClient = useQueryClient()

  // Fetch blogs using React Query
  const { data: blogs = [], isLoading: isLoadingBlogs } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const response = await blogApi.getBlogs()
      return response.data.data.items
    }
  })

  // Filter data based on search
  const filteredData = useMemo(() => {
    return blogs.filter((item) =>
      Object.values(item).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    )
  }, [blogs, searchText])

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
        to: '/admin/blogs/$blogId/edit',
        params: { blogId: record.id }
      })
    },
    [navigate]
  )

  const handleDelete = useCallback(
    (record: DataType) => {
      Modal.confirm({
        title: 'Are you sure you want to delete this blog post?',
        content: 'This action cannot be undone.',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          try {
            // Implement delete blog API call here
            message.success('Blog post deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['blogs'] })
          } catch (error) {
            console.error('Error deleting blog post:', error)
            message.error('Failed to delete blog post')
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
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        width: '30%',
        render: (text: string) => (
          <MemoizedHighlightText text={text} searchText={searchText} />
        )
      },
      {
        title: 'Author',
        dataIndex: 'staffName',
        key: 'staffName',
        width: '15%',
        render: (text: string) => (
          <MemoizedHighlightText text={text} searchText={searchText} />
        )
      },
      {
        title: 'Preview',
        dataIndex: 'shortenContent',
        key: 'shortenContent',
        width: '25%',
        render: (text: string) => (
          <div className="line-clamp-2">
            <MemoizedHighlightText text={text} searchText={searchText} />
          </div>
        )
      },
      {
        title: 'Tags',
        key: 'tags',
        width: '20%',
        render: (_: unknown, record: DataType) => (
          <div className="flex flex-wrap gap-2">
            {record.tags.map((tag) => {
              const tagType = tag.name as TagType
              const config = tagConfig[tagType] || {
                color: 'bg-gray-500/10 text-gray-500',
                icon: <TagIcon className="size-3" />
              }

              return (
                <span
                  key={tag.name}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${config.color}`}
                >
                  {config.icon}
                  {tag.name}
                </span>
              )
            })}
          </div>
        )
      },
      {
        title: 'Actions',
        key: 'actions',
        width: '10%',
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
        items={['Admin Dashboard', 'Blogs']}
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
              <span className="text-lg font-semibold">Blog Posts</span>
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Input
                    prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                    placeholder="Search blogs..."
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
                    onClick={() => navigate({ to: '/admin/blogs/add' })}
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
              loading={isLoadingBlogs}
              pagination={{
                pageSize: 7,
                showSizeChanger: false
              }}
            />
          </motion.div>
        </MotionCard>
      </motion.div>
    </ConfigProvider>
  )
}
