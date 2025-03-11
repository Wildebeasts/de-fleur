/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable tailwindcss/no-custom-classname */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useBreadcrumb } from '@/lib/context/BreadcrumbContext'
import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import {
  Table,
  ConfigProvider,
  Dropdown,
  Button,
  Modal,
  message,
  Tooltip,
  Badge,
  Rate,
  Card,
  Image,
  Upload
} from 'antd'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ColumnType } from 'antd/es/table'
import 'antd/dist/reset.css'
import {
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  PlusOutlined,
  CloseOutlined,
  UploadOutlined,
  InboxOutlined
} from '@ant-design/icons'
import { Input, Checkbox } from 'antd'
import { useNavigate } from '@tanstack/react-router'
import React from 'react'
import { BreadcrumbUpdater } from '@/components/BreadcrumbUpdater'
import { ImageOff } from 'lucide-react'
import cosmeticApi from '@/lib/services/cosmeticApi'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import brandApi from '@/lib/services/brandApi'
import skinTypeApi from '@/lib/services/skinTypeApi'
import cosmeticTypeApi from '@/lib/services/cosmeticTypeApi'
import { RcFile, UploadFile, UploadFileStatus } from 'antd/es/upload/interface'

interface CosmeticDto {
  id: string
  createAt: string | null
  createdBy: string | null
  lastModified: string | null
  lastModifiedBy: string | null
  isActive: boolean
  brandId: string
  brand: BrandDto | null
  skinTypeId: string
  skinType: SkinTypeDto
  cosmeticTypeId: string
  cosmeticType: CosmeticTypeDto | null
  name: string | null
  price: number
  gender: boolean
  notice: string | null
  ingredients: string | null
  mainUsage: string | null
  texture: string | null
  origin: string | null
  instructions: string | null
  cosmeticSubcategories: SubCategoryDto[]
  cosmeticImages: CosmeticImageDto[]
  feedbacks: FeedbackDto[]
  quantity: number
  rating: number | null
  volumeUnit: string | null
  thumbnailUrl?: string
}

interface BrandDto {
  id: string
  name: string | null
  description: string | null
  websiteUrl: string | null
  logoUrl: string | undefined
}

interface SkinTypeDto {
  id: string
  name: string | null
  description: string | null
  isDry: boolean
  isSensitive: boolean
  isUneven: boolean
  isWrinkle: boolean
}

interface CosmeticTypeDto {
  id: string
  name: string | null
  description: string | null
}

interface SubCategoryDto {
  cosmeticId: string
  subCategoryId: string
  subCategory: {
    id: string
    name: string | null
    description: string | null
    categoryId: string
  }
}

interface CosmeticImageDto {
  id: string
  cosmetic: {
    id: string
    name: string | null
    price: number
  }
  imageUrl: string | null
}

interface FeedbackDto {
  id: string
  customer: {
    id: string | null
    userName: string | null
    email: string | null
  }
  content: string | null
  rating: number
}

interface DataType extends CosmeticDto {
  key: string
  batches?: Array<{
    expirationDate: string
  }>
}

// Define HighlightText as a regular component first
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

// Then memoize it
const MemoizedHighlightText = React.memo(HighlightText)

// eslint-disable-next-line @typescript-eslint/no-unused-vars

const MotionCard = motion(Card)

// Add this interface near your other interfaces
interface CustomUploadFile extends Omit<UploadFile, 'status'> {
  status?: UploadFileStatus
}

// Replace the existing ImageUploadModal with this simplified version
const ImageUploadModal = ({
  visible,
  onCancel,
  cosmeticId,
  onSuccess
}: {
  visible: boolean
  onCancel: () => void
  cosmeticId: string
  onSuccess: () => void
}) => {
  const [fileList, setFileList] = useState<CustomUploadFile[]>([])
  const [uploading, setUploading] = useState(false)

  // Reset file list when modal opens with a new cosmetic
  useEffect(() => {
    if (visible) {
      setFileList([])
    }
  }, [visible, cosmeticId])

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Please select at least one image to upload')
      return
    }

    setUploading(true)

    try {
      // Get the File objects from the fileList
      const files = fileList
        .map((file) => file.originFileObj)
        .filter((file): file is RcFile => !!file)

      // Call the API to upload images with File objects directly
      await cosmeticApi.uploadCosmeticImages({
        cosmeticId,
        images: files
      })

      message.success('Images uploaded successfully')
      setFileList([])
      onSuccess()
      onCancel()
    } catch (error) {
      console.error('Error uploading images:', error)
      message.error('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const uploadProps = {
    onRemove: (file: CustomUploadFile) => {
      const index = fileList.indexOf(file)
      const newFileList = fileList.slice()
      newFileList.splice(index, 1)
      setFileList(newFileList)
    },
    beforeUpload: (file: File) => {
      // Validate file type
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        message.error('You can only upload image files!')
        return false
      }

      // Validate file size (5MB limit)
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!')
        return false
      }

      // Add file to list
      setFileList((prev) => [
        ...prev,
        {
          uid: file.name,
          name: file.name,
          originFileObj: file
        } as CustomUploadFile
      ])

      // Return false to prevent automatic upload
      return false
    },
    fileList
  }

  return (
    <Modal
      title="Upload Images"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={uploading}
          onClick={handleUpload}
          disabled={fileList.length === 0}
        >
          {uploading ? 'Uploading' : 'Upload'}
        </Button>
      ]}
      className="image-upload-modal"
    >
      <Upload.Dragger {...uploadProps} listType="picture" multiple>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag images to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for single or bulk upload. Strictly prohibited from uploading
          company data or other banned files.
        </p>
      </Upload.Dragger>
    </Modal>
  )
}

export default function Courses() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { updateBreadcrumb } = useBreadcrumb()
  const navigate = useNavigate()

  // State declarations
  const [data] = useState<DataType[]>([])
  const [searchText, setSearchText] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const [uploadModalVisible, setUploadModalVisible] = useState(false)
  const [selectedCosmeticId, setSelectedCosmeticId] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [sortColumn, setSortColumn] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  const queryClient = useQueryClient()

  // Add these queries at the top of your component
  const { data: cosmeticsData, isLoading: isLoadingCosmetics } = useQuery({
    queryKey: ['cosmetics', currentPage, pageSize, sortColumn, sortOrder, searchText],
    queryFn: async () => {
      const response = await cosmeticApi.getCosmetics(
        currentPage,
        pageSize,
        sortColumn,
        sortOrder,
        searchText
      )
      if (response.data.isSuccess) {
        return {
          items: response.data.data?.items.map(item => ({
            ...item,
            key: item.id
          })),
          totalCount: response.data.data?.totalCount || (response.data.data?.totalPages || 0) * pageSize,
          totalPages: response.data.data?.totalPages || 0
        }
      }
      throw new Error('Failed to fetch cosmetics')
    }
  })

  const { data: brands = [], isLoading: isLoadingBrands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await brandApi.getBrands()
      return response.data.data
    }
  })

  const { data: skinTypes = [], isLoading: isLoadingSkinTypes } = useQuery({
    queryKey: ['skinTypes'],
    queryFn: async () => {
      const response = await skinTypeApi.getSkinTypes()
      return response.data.data
    }
  })

  const { data: cosmeticTypes = [], isLoading: isLoadingCosmeticTypes } =
    useQuery({
      queryKey: ['cosmeticTypes'],
      queryFn: async () => {
        const response = await cosmeticTypeApi.getCosmeticTypes()
        return response.data.data
      }
    })

  // Filter data based on search
  const filteredData = useMemo(() => {
    return cosmeticsData?.items?.filter((item) =>
      Object.values(item).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    ) ?? []
  }, [cosmeticsData, searchText])

  // Add search handler
  const handleGlobalSearch = (value: string) => {
    setSearchText(value)
    setCurrentPage(1) // Reset to first page when searching

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set a new timeout to debounce the search
    searchTimeoutRef.current = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['cosmetics'] })
    }, 500)
  }

  // Add cleanup effect
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Define ALL handler functions before columns
  const handleEdit = useCallback(
    (record: DataType) => {
      navigate({
        to: `/admin/cosmetics/${record.id}/edit`,
      })
    },
    [navigate]
  )

  // Update delete handler to use mutation
  const handleDelete = useCallback(
    (record: DataType) => {
      Modal.confirm({
        title: 'Are you sure you want to delete this product?',
        content: 'This action cannot be undone.',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          try {
            await cosmeticApi.deleteCosmetic(record.id)
            message.success('Product deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['cosmetics'] })
          } catch (error) {
            console.error('Error deleting product:', error)
            message.error('Failed to delete product')
          }
        }
      })
    },
    [queryClient]
  )

  // THEN define columns
  const columns = useMemo(
    () => [
      {
        title: 'Product Name',
        dataIndex: 'name',
        key: 'name',
        width: '25%',
        render: (text: string, record: DataType) => (
          <Tooltip
            title={
              <div>
                <div className="font-semibold">{text}</div>
                <div className="mt-1 text-xs text-gray-300">
                  {record.mainUsage}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {record.ingredients && (
                    <>
                      <span className="font-medium">Ingredients:</span>{' '}
                      {record.ingredients.length > 100
                        ? `${record.ingredients.substring(0, 100)}...`
                        : record.ingredients}
                    </>
                  )}
                </div>
              </div>
            }
            placement="rightTop"
          >
            <div className="flex items-center gap-3">
              <div className="relative size-10">
                {record.thumbnailUrl ? (
                  <Image
                    src={record.thumbnailUrl}
                    alt={text}
                    className="size-10 cursor-pointer rounded-lg object-cover shadow-sm"
                    preview={{
                      mask: null,
                      maskClassName:
                        'opacity-0 hover:opacity-100 transition-opacity',
                      rootClassName: 'product-image-preview'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement
                        ?.querySelector('.thumbnail-placeholder')
                        ?.classList.remove('hidden')
                    }}
                  />
                ) : record.cosmeticImages?.[0]?.imageUrl ? (
                  <Image
                    src={record.cosmeticImages[0].imageUrl}
                    alt={text}
                    className="size-10 cursor-pointer rounded-lg object-cover shadow-sm"
                    preview={{
                      mask: null,
                      maskClassName:
                        'opacity-0 hover:opacity-100 transition-opacity',
                      rootClassName: 'product-image-preview'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement
                        ?.querySelector('.thumbnail-placeholder')
                        ?.classList.remove('hidden')
                    }}
                  />
                ) : (
                  <div
                    className="thumbnail-placeholder flex size-10 cursor-pointer items-center justify-center rounded-lg bg-gray-800 transition-colors hover:bg-gray-700"
                    onClick={() => handleOpenUploadModal(record.id)}
                  >
                    <Tooltip title="Upload image">
                      <UploadOutlined className="size-5 text-gray-500" />
                    </Tooltip>
                  </div>
                )}
              </div>
              <div className="flex max-w-[200px] flex-col">
                <div className="truncate font-medium text-gray-200">
                  <MemoizedHighlightText
                    text={text || 'Unnamed Product'}
                    searchText={searchText}
                  />
                </div>
                <div className="truncate text-xs text-gray-500">
                  <MemoizedHighlightText
                    text={record.mainUsage || 'No description'}
                    searchText={searchText}
                  />
                </div>
              </div>
            </div>
          </Tooltip>
        )
      },
      {
        title: 'Brand & Type',
        key: 'brandAndType',
        width: '20%',
        render: (_: unknown, record: DataType) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {record.brand?.logoUrl && (
                <img
                  src={record.brand?.logoUrl || ''}
                  // @ts-expect-error -- logoUrl is optional
                  alt={record.brand?.name}
                  className="size-5 object-contain"
                />
              )}
              <span className="font-medium text-gray-300">
                {record.brand?.name || 'No brand'}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {record.cosmeticType?.name || 'No type'}
            </span>
          </div>
        )
      },
      {
        title: 'Stock',
        key: 'stock',
        width: '15%',
        render: (_: unknown, record: DataType) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-300">
              {record.quantity} units
            </span>
            <span className="text-xs text-gray-500">
              {record.batches?.[0]?.expirationDate
                ? `Expires: ${new Date(
                  record.batches[0].expirationDate
                ).toLocaleDateString()}`
                : 'No expiry date'}
            </span>
          </div>
        )
      },
      {
        title: 'Rating',
        dataIndex: 'rating',
        key: 'rating',
        width: '15%',
        render: (rating: number | null, record: DataType) => (
          <div className="flex items-center gap-2">
            <Rate
              disabled
              allowHalf
              value={rating || 0}
              className="text-xs"
              style={{ fontSize: '14px' }}
            />
            <span className="text-xs text-gray-400">
              ({rating?.toFixed(1) || '0.0'})
            </span>
          </div>
        )
      },
      {
        title: 'Volume',
        key: 'volume',
        width: '15%',
        render: (_: unknown, record: DataType) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-300">
              {record.volumeUnit || 'N/A'}
            </span>
          </div>
        )
      },
      {
        title: 'Status',
        dataIndex: 'isActive',
        key: 'status',
        width: '8%',
        render: (isActive: boolean) => (
          <Badge
            status={isActive ? 'success' : 'error'}
            text={
              <span style={{ color: isActive ? '#10b981' : '#ef4444' }}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            }
          />
        )
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 80,
        align: 'center' as const,
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

  // Add expandable config for nested tables
  const expandableConfig = useMemo(
    () => ({
      expandedRowRender: (record: DataType) => (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6 p-4"
        >
          {/* Skin Type Details */}
          <MotionCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            title={
              <span className="text-sm font-medium text-gray-200">
                Skin Type Details
              </span>
            }
            className="border-0 bg-[#141414]"
            headStyle={{
              backgroundColor: '#1f1f1f',
              borderBottom: '1px solid #303030'
            }}
            bodyStyle={{ backgroundColor: '#141414' }}
          >
            <div className="rounded-lg border border-gray-800 bg-[#1f1f1f] p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs font-medium uppercase text-gray-500">
                    Name
                  </div>
                  <div className="mt-1 text-gray-200">
                    {record.skinType.name}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs font-medium uppercase text-gray-500">
                    Description
                  </div>
                  <div className="mt-1 text-gray-200">
                    {record.skinType.description}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs font-medium uppercase text-gray-500">
                  Properties
                </div>
                <div className="mt-2 flex gap-2">
                  {record.skinType.isSensitive && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center rounded-md bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/20"
                    >
                      Sensitive
                    </motion.span>
                  )}
                  {record.skinType.isUneven && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="inline-flex items-center rounded-md bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-400 ring-1 ring-inset ring-yellow-500/20"
                    >
                      Uneven
                    </motion.span>
                  )}
                  {record.skinType.isWrinkle && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-400 ring-1 ring-inset ring-purple-500/20"
                    >
                      Wrinkle
                    </motion.span>
                  )}
                </div>
              </div>
            </div>
          </MotionCard>

          {/* Product Details */}
          <MotionCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            title={
              <span className="text-sm font-medium text-gray-200">
                Product Details
              </span>
            }
            className="border-0 bg-[#141414]"
            headStyle={{
              backgroundColor: '#1f1f1f',
              borderBottom: '1px solid #303030'
            }}
            bodyStyle={{ backgroundColor: '#141414' }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-800 bg-[#1f1f1f] p-4">
                <div className="text-xs font-medium uppercase text-gray-500">
                  Origin
                </div>
                <div className="mt-1 text-gray-200">{record.origin}</div>
              </div>
              <div className="rounded-lg border border-gray-800 bg-[#1f1f1f] p-4">
                <div className="text-xs font-medium uppercase text-gray-500">
                  Texture
                </div>
                <div className="mt-1 text-gray-200">{record.texture}</div>
              </div>
              <div className="col-span-2 rounded-lg border border-gray-800 bg-[#1f1f1f] p-4">
                <div className="text-xs font-medium uppercase text-gray-500">
                  Instructions
                </div>
                <div className="mt-1 text-gray-200">{record.instructions}</div>
              </div>
              <div className="col-span-2 rounded-lg border border-gray-800 bg-[#1f1f1f] p-4">
                <div className="text-xs font-medium uppercase text-gray-500">
                  Notice
                </div>
                <div className="mt-1 text-gray-200">{record.notice}</div>
              </div>
            </div>
          </MotionCard>

          {/* Reviews Section */}
          <MotionCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            title={
              <span className="text-sm font-medium text-gray-200">
                Reviews ({record.feedbacks.length})
              </span>
            }
            className="border-0 bg-[#141414]"
            headStyle={{
              backgroundColor: '#1f1f1f',
              borderBottom: '1px solid #303030'
            }}
            bodyStyle={{ backgroundColor: '#141414' }}
          >
            <div className="space-y-3">
              {record.feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="rounded-lg border border-gray-800 bg-[#1f1f1f] p-4"
                >
                  <div className="flex items-center justify-between">
                    <Rate
                      disabled
                      value={feedback.rating}
                      className="text-sm"
                    />
                  </div>
                  <div className="mt-2 text-sm text-gray-400">
                    {feedback.content}
                  </div>
                </div>
              ))}
              {record.feedbacks.length === 0 && (
                <div className="text-sm text-gray-400">No reviews yet</div>
              )}
            </div>
          </MotionCard>

          {/* Subcategories */}
          {record.cosmeticSubcategories.length > 0 && (
            <MotionCard
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              title={
                <span className="text-sm font-medium text-gray-200">
                  Subcategories
                </span>
              }
              className="border-0 bg-[#141414]"
              headStyle={{
                backgroundColor: '#1f1f1f',
                borderBottom: '1px solid #303030'
              }}
              bodyStyle={{ backgroundColor: '#141414' }}
            >
              <motion.div
                className="grid gap-3"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                initial="hidden"
                animate="show"
              >
                {record.cosmeticSubcategories.map((subCategory) => (
                  <motion.div
                    key={subCategory.subCategoryId}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      show: { opacity: 1, x: 0 }
                    }}
                    className="rounded-lg border border-gray-800 bg-[#1f1f1f] p-4"
                  >
                    <div className="font-medium text-gray-200">
                      {subCategory.subCategory.name}
                    </div>
                    <div className="mt-1 text-sm text-gray-400">
                      {subCategory.subCategory.description}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </MotionCard>
          )}
        </motion.div>
      )
    }),
    []
  )

  const isLoading =
    isLoadingCosmetics ||
    isLoadingBrands ||
    isLoadingSkinTypes ||
    isLoadingCosmeticTypes

  // Update tableConfig to use new data source
  const tableConfig = useMemo(
    () => ({
      columns,
      dataSource: cosmeticsData?.items || [],
      loading: isLoading,
      rowSelection: {
        type: 'checkbox' as const,
        selectedRowKeys,
        onChange: setSelectedRowKeys,
        columnTitle: '',
        columnWidth: 48,
        hideSelectAll: true
      },
      expandable: expandableConfig,
      pagination: {
        current: currentPage,
        total: cosmeticsData?.totalCount ?? 0,
        pageSize: pageSize,
        onChange: (page: number) => {
          setCurrentPage(page)
        },
        showTotal: (total: number) => `Total ${total} items`,
        showSizeChanger: true,
        pageSizeOptions: ['12', '24', '36', '48'],
        onShowSizeChange: (current: number, size: number) => {
          setPageSize(size)
          setCurrentPage(1) // Reset to first page when changing page size
        }
      },
      scroll: { y: 800 },
      size: 'middle' as const,
      className: 'custom-dark-table',
      onChange: (pagination: any, filters: any, sorter: any) => {
        if (sorter.field && sorter.order) {
          setSortColumn(sorter.field)
          setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc')
        }
      }
    }),
    [
      columns,
      cosmeticsData,
      isLoading,
      selectedRowKeys,
      expandableConfig,
      currentPage,
      pageSize
    ]
  )

  const handleMasterCheckboxChange = (e: CheckboxChangeEvent) => {
    setSelectedRowKeys(e.target.checked ? data.map((item) => item.key) : [])
  }

  const handleAdd = useCallback(() => {
    navigate({ to: '/admin/cosmetics/create' })
  }, [navigate])

  // Update bulk delete handler
  const handleDeleteSelected = async () => {
    Modal.confirm({
      title: 'Are you sure you want to delete selected products?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await Promise.all(
            selectedRowKeys.map((key) =>
              cosmeticApi.deleteCosmetic(key.toString())
            ),
          )
          message.success('Products deleted successfully')
          setSelectedRowKeys([])
          queryClient.invalidateQueries({ queryKey: ['cosmetics'] })
        } catch (error) {
          console.error('Error deleting products:', error)
          message.error('Failed to delete products')
        }
      }
    })
  }

  // Update table theme with better text contrast and pagination styling
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
      },
      Input: {
        colorBgContainer: '#141414',
        colorBorder: '#282d35',
        colorText: '#e5e7eb',
        colorTextPlaceholder: '#8b949e',
        colorIcon: '#8b949e',
        colorIconHover: '#3b82f6',
        activeBorderColor: '#3b82f6',
        hoverBorderColor: '#141414'
      }
    },
    token: {
      colorText: '#e5e7eb',
      colorTextSecondary: '#9ca3af',
      colorTextTertiary: '#6b7280',
      colorBgContainer: '#141414',
      colorBorder: '#303030',
      borderRadius: 6,
      controlHeight: 32,
      fontSize: 14
    }
  } as const

  // Add these styles to your global CSS
  const additionalStyles = `
    .custom-dark-table .ant-table-body {
      min-height: 800px !important;
      max-height: 800px !important;
    }

    .custom-dark-table .ant-table-expanded-row > .ant-table-cell {
      padding: 20px 16px;
    }

    .custom-dark-table .ant-table-expanded-row-fixed {
      margin: 0 !important;
    }

    .custom-dark-table .ant-table-row-selected > td {
      background-color: rgba(74, 222, 128, 0.08) !important;
    }

    .custom-dark-table .ant-table-row-selected:hover > td {
      background-color: rgba(74, 222, 128, 0.12) !important;
    }

    .custom-dark-table .ant-checkbox-checked .ant-checkbox-inner {
      background-color: #4ade80;
      border-color: #4ade80;
    }

    .custom-dark-table .ant-pagination {
      margin-top: 16px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    .custom-dark-table .ant-pagination-item {
      background: transparent;
      border: none;
      min-width: 32px;
      height: 32px;
      line-height: 32px;
      margin-right: 8px;
    }

    .custom-dark-table .ant-pagination-item:hover {
      background: #1f2937;
    }

    .custom-dark-table .ant-pagination-item-active {
      background: #3b82f6;
    }

    .custom-dark-table .ant-pagination-item-active a {
      color: white !important;
    }

    .custom-dark-table .ant-pagination-prev,
    .custom-dark-table .ant-pagination-next {
      min-width: 32px;
      height: 32px;
      line-height: 32px;
      background: transparent;
      border: none;
    }

    .custom-dark-table .ant-pagination-prev:hover,
    .custom-dark-table .ant-pagination-next:hover {
      background: #1f2937;
    }

    .custom-dark-table .ant-pagination-item a {
      color: #9ca3af;
      padding: 0 6px;
    }

    .custom-dark-table .ant-pagination-item:hover a {
      color: #3b82f6;
    }

    .custom-pagination.ant-pagination {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .custom-pagination .ant-pagination-item,
    .custom-pagination .ant-pagination-prev,
    .custom-pagination .ant-pagination-next {
      min-width: 32px;
      height: 32px;
      line-height: 32px;
      border-radius: 6px;
      border: none;
      background: transparent;
      margin: 0;
    }

    .custom-pagination .ant-pagination-item a {
      color: #9ca3af;
      font-size: 14px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .custom-pagination .ant-pagination-item:hover {
      background: #1f2937;
    }

    .custom-pagination .ant-pagination-item:hover a {
      color: #3b82f6;
    }

    .custom-pagination .ant-pagination-item-active {
      background: #3b82f6;
    }

    .custom-pagination .ant-pagination-item-active a,
    .custom-pagination .ant-pagination-item-active:hover a {
      color: white;
    }

    .custom-pagination .ant-pagination-prev button,
    .custom-pagination .ant-pagination-next button {
      color: #9ca3af;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .custom-pagination .ant-pagination-prev:hover,
    .custom-pagination .ant-pagination-next:hover {
      background: #1f2937;
    }

    .custom-pagination .ant-pagination-prev:hover button,
    .custom-pagination .ant-pagination-next:hover button {
      color: #3b82f6;
    }

    .custom-pagination .ant-pagination-disabled,
    .custom-pagination .ant-pagination-disabled:hover {
      background: transparent;
    }

    .custom-pagination .ant-pagination-disabled button,
    .custom-pagination .ant-pagination-disabled:hover button {
      color: #4b5563;
    }

    /* Product image preview styles */
    .product-image-preview .ant-image-preview-root {
      z-index: 1050;
    }

    .product-image-preview .ant-image-preview-img {
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }

    .product-image-preview .ant-image-preview-operations {
      background: rgba(0, 0, 0, 0.7);
    }

    .product-image-preview .ant-image-preview-switch-left,
    .product-image-preview .ant-image-preview-switch-right {
      background: rgba(0, 0, 0, 0.3);
      color: white;
      border-radius: 50%;
      padding: 8px;
    }

    .product-image-preview .ant-image-preview-switch-left:hover,
    .product-image-preview .ant-image-preview-switch-right:hover {
      background: rgba(0, 0, 0, 0.6);
    }

    /* Image upload modal styles */
    .image-upload-modal .ant-modal-content {
      background-color: #1a1b24;
      border: 1px solid #282d35;
    }

    .image-upload-modal .ant-modal-header {
      background-color: #1a1b24;
      border-bottom: 1px solid #282d35;
    }

    .image-upload-modal .ant-modal-title {
      color: #e5e7eb;
    }

    .image-upload-modal .ant-modal-close {
      color: #8b949e;
    }

    .image-upload-modal .ant-modal-close:hover {
      color: #e5e7eb;
    }

    .image-upload-modal .ant-upload-list {
      color: #e5e7eb;
    }

    .image-upload-modal .ant-upload-drag {
      background-color: #141414;
      border: 1px dashed #303030;
    }

    .image-upload-modal .ant-upload-drag:hover {
      border-color: #3b82f6;
    }

    .image-upload-modal .ant-upload-list-item {
      border-color: #303030;
    }

    .image-upload-modal .ant-upload-list-item-name {
      color: #e5e7eb;
    }

    .image-upload-modal .ant-upload-list-item-card-actions .anticon {
      color: #e5e7eb;
    }
  `

  // Add this function to handle opening the upload modal
  const handleOpenUploadModal = useCallback((cosmeticId: string) => {
    setSelectedCosmeticId(cosmeticId)
    setUploadModalVisible(true)
  }, [])

  // Add this function to handle successful uploads
  const handleUploadSuccess = () => {
    // Refresh the cosmetics data after successful upload
    queryClient.invalidateQueries({ queryKey: ['cosmetics'] })
  }

  return (
    <ConfigProvider theme={tableTheme}>
      <style>{`
        .nested-table .ant-table {
          margin: 0 !important;
        }

        /* Style for section level */
        .nested-table:first-child {
          background: #282d35;
        }

        /* Style for step level */
        .nested-table .nested-table {
          background: #2c333a;
        }

        /* Add some spacing between tables */
        .ant-table-expanded-row {
          margin: 8px 0;
        }

        /* Thumbnail preview modal styles */
        .thumbnail-preview-modal .ant-modal-content {
          background: #1a1b24;
          border: 1px solid #282d35;
          padding: 16px;
        }

        .thumbnail-preview-modal .ant-modal-close {
          color: #8b949e;
        }

        .thumbnail-preview-modal .ant-modal-close:hover {
          color: #ffffff;
        }

        ${additionalStyles}
      `}</style>
      <BreadcrumbUpdater
        items={['Admin Dashboard', 'Cosmetics']}
        previousItems={['Admin Dashboard']}
      />
      <div className="mx-auto mt-32 w-[70%]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative mb-6 flex items-center justify-between overflow-hidden rounded-xl border border-[#282d35] bg-[#1a1b24] px-8 py-5 shadow-lg"
        >
          {/* Background accent */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="absolute inset-0 bg-gradient-to-r from-[#3b82f615] to-transparent"
          />

          {/* Left side content */}
          <div className="relative flex items-center gap-3">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 48 }}
              transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
              className="w-1 rounded-full bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            />
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="flex flex-col"
            >
              <span className="text-[0.95rem] leading-relaxed text-[#d0dbea]">
                Want to{' '}
                <span className="font-semibold text-[#3b82f6]">view</span>{' '}
                coupons?
              </span>
              <span className="text-[0.85rem] text-[#8b949e]">
                Go to Coupons page to manage coupons
              </span>
            </motion.div>
          </div>

          {/* Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="primary"

              onClick={() => navigate({ to: '/admin/coupons' })}
              style={{
                backgroundColor: '#1e1f2a',
                color: '#3b82f6',
                border: '1px solid #3b82f640',
                boxShadow: '0 0 10px rgba(59,130,246,0.1)',
                height: '38px',
                padding: '0 24px',
                zIndex: 1
              }}
              className="transition-all duration-300 hover:!border-[#3b82f660] hover:!bg-[#3b82f620] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            >
              View Coupons
            </Button>
          </motion.div>
        </motion.div>

        <div className="mb-4 flex flex-col items-center gap-4 rounded-lg bg-[#1f1f1f] p-6 md:flex-row">
          <Checkbox
            checked={selectedRowKeys.length === data.length}
            indeterminate={
              selectedRowKeys.length > 0 && selectedRowKeys.length < data.length
            }
            onChange={handleMasterCheckboxChange}
          />

          <div className="flex-1">
            <Input
              prefix={<SearchOutlined className="text-[#8b949e]" />}
              placeholder=" Smart Search..."
              className="w-full bg-[#141414]"
              value={searchText}
              onChange={(e) => handleGlobalSearch(e.target.value)}
              allowClear={{
                clearIcon: (
                  <CloseOutlined className="text-white hover:text-blue-500" />
                )
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            <Button
              icon={<DeleteOutlined />}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                boxShadow: 'none'
              }}
              type="primary"
              onClick={handleDeleteSelected}
              disabled={selectedRowKeys.length === 0}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                boxShadow: 'none'
              }}
              className="hover:!bg-[#2563eb]"
            >
              Add Product
            </Button>
          </div>
        </div>

        {/* @ts-expect-error - Table is actually supported */}
        <Table {...tableConfig} />

        {/* Add the upload modal */}
        <ImageUploadModal
          visible={uploadModalVisible}
          onCancel={() => setUploadModalVisible(false)}
          cosmeticId={selectedCosmeticId}
          onSuccess={() =>
            queryClient.invalidateQueries({ queryKey: ['cosmetics'] })
          }
        />
      </div>
    </ConfigProvider>
  )
}
