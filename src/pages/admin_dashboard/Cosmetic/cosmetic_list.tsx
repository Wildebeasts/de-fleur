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
  Upload,
  Tag,
  Space
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
  InboxOutlined,
  EyeOutlined,
  BarChartOutlined,
  StarFilled,
  StarOutlined,
  MinusOutlined
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
import batchApi from '@/lib/services/batchApi'
import { RcFile, UploadFile, UploadFileStatus } from 'antd/es/upload/interface'
import { format } from 'date-fns'

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
  weight?: number
  length?: number
  width?: number
  height?: number
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
        return response.data.data
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

  const { data: batches = [], isLoading: isLoadingBatches } = useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      const response = await batchApi.getBatches()
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

  const { data: cosmeticTypes = [], isLoading: isLoadingCosmeticTypes } = useQuery({
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

  // First, declare handleOpenUploadModal
  const handleOpenUploadModal = useCallback((cosmeticId: string) => {
    setSelectedCosmeticId(cosmeticId)
    setUploadModalVisible(true)
  }, [])

  // Then declare handleMoreActions which depends on handleOpenUploadModal
  const handleMoreActions = useCallback((record: CosmeticDto) => {
    Modal.info({
      title: 'Additional Actions',
      content: (
        <div className="mt-4 flex flex-col gap-2">
          <Button
            type="text"
            icon={<UploadOutlined />}
            onClick={() => {
              Modal.destroyAll()
              handleOpenUploadModal(record.id)
            }}
            className="flex items-center justify-start text-blue-500 hover:text-blue-400"
          >
            Upload Images
          </Button>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              Modal.destroyAll()
              navigate({ to: `/store/products/${record.id}` })
            }}
            className="flex items-center justify-start text-green-500 hover:text-green-400"
          >
            View in Store
          </Button>
          <Button
            type="text"
            icon={<BarChartOutlined />}
            onClick={() => {
              Modal.destroyAll()
              // Add analytics navigation here
            }}
            className="flex items-center justify-start text-purple-500 hover:text-purple-400"
          >
            View Analytics
          </Button>
        </div>
      ),
      icon: null,
      className: 'more-actions-modal',
      footer: null,
      width: 250
    })
  }, [navigate, handleOpenUploadModal])

  // Finally, declare columns which depends on both functions
  const columns = useMemo(
    () => [
      {
        title: 'Product Name',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: CosmeticDto) => (
          <div className="flex items-center gap-3">
            <div className="relative size-10">
              <Tooltip title="Click to update thumbnail">
                <div 
                  className="group relative cursor-pointer"
                  onClick={async () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        try {
                          await cosmeticApi.uploadCosmeticImages({
                            cosmeticId: record.id,
                            images: [file],
                            imageType: 'thumbnail'
                          });
                          message.success('Thumbnail updated successfully');
                          queryClient.invalidateQueries({ queryKey: ['cosmetics'] });
                        } catch (error) {
                          console.error('Error updating thumbnail:', error);
                          message.error('Failed to update thumbnail');
                        }
                      }
                    };
                    input.click();
                  }}
                >
                  {record.thumbnailUrl ? (
                    <Image
                      src={record.thumbnailUrl}
                      alt={text}
                      className="size-10 rounded-lg object-cover shadow-sm transition-opacity group-hover:opacity-75"
                      preview={false}
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-lg bg-gray-800 transition-colors group-hover:bg-gray-700">
                      <UploadOutlined className="size-5 text-gray-500" />
                    </div>
                  )}
                </div>
              </Tooltip>
            </div>
            <div>
              <div className="font-medium text-white">{text}</div>
              <div className="text-sm text-gray-400">{record.mainUsage || 'No usage specified'}</div>
            </div>
          </div>
        )
      },
      {
        title: 'Brand & Type',
        key: 'brand',
        render: (_, record: CosmeticDto) => {
          const brand = brands?.find(b => b.id === record.brandId)
          const cosmeticType = cosmeticTypes?.find(c => c.id === record.cosmeticTypeId)
          return (
            <div>
              <div className="font-medium text-white">{brand?.name || 'No brand'}</div>
              <div className="text-sm text-gray-400">{cosmeticType?.name || 'No type'}</div>
            </div>
          )
        }
      },
      {
        title: 'Stock',
        key: 'stock',
        render: (_, record: CosmeticDto) => {
          const cosmeticBatches = batches.filter(b => b.cosmeticId === record.id)
          const totalQuantity = cosmeticBatches.reduce((sum, batch) => sum + batch.quantity, 0)
          const nearestExpiry = cosmeticBatches
            .filter(b => b.expirationDate)
            .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())[0]

          return (
            <div>
              <div className="font-medium text-white">{totalQuantity} units</div>
              <div className="text-sm text-gray-400">
                {nearestExpiry 
                  ? `Expires: ${format(new Date(nearestExpiry.expirationDate), 'dd/MM/yyyy')}`
                  : 'No expiry date'}
              </div>
            </div>
          )
        }
      },
      {
        title: 'Rating',
        dataIndex: 'rating',
        key: 'rating',
        render: (rating: number) => (
          <div>
            <Rate disabled defaultValue={rating || 0} allowHalf />
            <div className="text-sm text-gray-400">
              ({rating?.toFixed(1) || '0.0'})
            </div>
          </div>
        )
      },
      {
        title: 'Volume',
        key: 'volume',
        render: (_: unknown, record: CosmeticDto) => (
          <div className="text-white">
            {record.volumeUnit || 'N/A'}
          </div>
        )
      },
      {
        title: 'Status',
        dataIndex: 'isActive',
        key: 'status',
        render: (isActive: boolean) => (
          <Tag
            color={isActive ? 'success' : 'error'}
            className="min-w-[80px] text-center"
          >
            {isActive ? 'Active' : 'Inactive'}
          </Tag>
        )
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_: unknown, record: CosmeticDto) => (
          <Space size="middle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="text-blue-500 hover:text-blue-400"
            />
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              className="text-red-500 hover:text-red-400"
            />
            <Button
              type="text"
              onClick={() => handleMoreActions(record)}
              className="text-gray-400 hover:text-gray-300"
            >
              •••
            </Button>
          </Space>
        )
      }
    ],
    [handleDelete, handleEdit, handleMoreActions, queryClient]
  )

  // Update expandedRowRender to remove motion animations
  const expandedRowRender = useCallback((record: CosmeticDto) => {
    const brand = brands?.find(b => b.id === record.brandId)
    const skinType = skinTypes?.find(s => s.id === record.skinTypeId)
    const cosmeticType = cosmeticTypes?.find(c => c.id === record.cosmeticTypeId)

    const handleImageUpload = async (files: RcFile[]) => {
      try {
        await cosmeticApi.uploadCosmeticImages({
          cosmeticId: record.id,
          images: files
        })
        message.success('Images uploaded successfully')
        queryClient.invalidateQueries({ queryKey: ['cosmetics'] })
      } catch (error) {
        console.error('Error uploading images:', error)
        message.error('Failed to upload images')
      }
    }

    return (
      <div className="relative overflow-hidden rounded-xl border border-[#1d1f2b] bg-[#141414] p-6">
        {/* Decorative gradient line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3b82f640] to-transparent" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Brand Details Card */}
          <div className="rounded-lg border border-[#1d1f2b] bg-[#1a1b24] p-4">
            <h4 className="mb-4 text-xs font-medium uppercase tracking-wider text-[#8b949e]">
              Brand Details
            </h4>
            <div className="flex items-start gap-3">
              {brand?.logoUrl ? (
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="size-full bg-[#1d1f2b] object-contain p-2"
                  />
                </div>
              ) : (
                <div className="flex size-12 items-center justify-center rounded-lg bg-[#1d1f2b]">
                  <ImageOff className="size-6 text-[#8b949e]" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {brand?.name || 'N/A'}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-[#8b949e]">
                  {brand?.description || 'No description available'}
                </p>
                {brand?.websiteUrl && (
                  <a
                    href={brand.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    Visit Website
                    <motion.span whileHover={{ x: 2 }}>→</motion.span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Product Details Card */}
          <div className="rounded-lg border border-[#1d1f2b] bg-[#1a1b24] p-4">
            <h4 className="mb-4 text-xs font-medium uppercase tracking-wider text-[#8b949e]">
              Product Details
            </h4>
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#8b949e]">Main Usage</span>
                <span className="text-sm font-medium text-white">
                  {record.mainUsage || 'N/A'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#8b949e]">Gender</span>
                <Tag
                  color={record.gender ? 'blue' : 'purple'}
                  className="m-0 font-medium"
                >
                  {record.gender ? 'Male' : 'Female'}
                </Tag>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#8b949e]">Origin</span>
                <span className="text-sm font-medium text-white">
                  {record.origin || 'N/A'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#8b949e]">Instructions</span>
                <Tooltip title={record.instructions || 'No instructions available'}>
                  <span className="line-clamp-1 max-w-[200px] text-sm font-medium text-white">
                    {record.instructions || 'N/A'}
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Physical Properties Card */}
          <div className="rounded-lg border border-[#1d1f2b] bg-[#1a1b24] p-4">
            <h4 className="mb-4 text-xs font-medium uppercase tracking-wider text-[#8b949e]">
              Physical Properties
            </h4>
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#8b949e]">Weight</span>
                <span className="text-sm font-medium text-white">
                  {record.weight ? `${record.weight}g` : 'N/A'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#8b949e]">Dimensions</span>
                <span className="text-sm font-medium text-white">
                  {record.length && record.width && record.height
                    ? `${record.length}×${record.width}×${record.height}cm`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#8b949e]">Texture</span>
                <span className="text-sm font-medium text-white">
                  {record.texture || 'N/A'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#8b949e]">Volume</span>
                <span className="text-sm font-medium text-white">
                  {record.volumeUnit || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Classification Card */}
          <div className="rounded-lg border border-[#1d1f2b] bg-[#1a1b24] p-4">
            <h4 className="mb-4 text-xs font-medium uppercase tracking-wider text-[#8b949e]">
              Classification
            </h4>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-[#8b949e]">Skin Type</span>
                  <Tag color="cyan" className="m-0">
                    {skinType?.name || 'N/A'}
                  </Tag>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {skinType?.isDry && (
                    <Tag color="orange" className="m-0">
                      Dry
                    </Tag>
                  )}
                  {skinType?.isSensitive && (
                    <Tag color="red" className="m-0">
                      Sensitive
                    </Tag>
                  )}
                  {skinType?.isUneven && (
                    <Tag color="purple" className="m-0">
                      Uneven
                    </Tag>
                  )}
                  {skinType?.isWrinkle && (
                    <Tag color="gold" className="m-0">
                      Wrinkle
                    </Tag>
                  )}
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-[#8b949e]">Cosmetic Type</span>
                  <Tag color="blue" className="m-0">
                    {cosmeticType?.name || 'N/A'}
                  </Tag>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-[#8b949e]">
                  {cosmeticType?.description || 'No description available'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Images Gallery Section */}
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-brand-medium text-xs uppercase tracking-wider text-[#8b949e]">
              Product Images
            </h4>
          </div>

          {record.cosmeticImages?.length > 0 ? (
            <ImagesGallery record={record} onUpload={handleImageUpload} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#1d1f2b] bg-[#1a1b24] py-12">
              <ImageOff className="mb-3 size-8 text-[#8b949e]" />
              <p className="text-sm text-[#8b949e]">No images available</p>
              <Upload
                showUploadList={false}
                beforeUpload={(file) => {
                  handleImageUpload([file])
                  return false
                }}
              >
                <Button
                  type="link"
                  className="mt-2 text-blue-400 hover:text-blue-300"
                >
                  Upload Images
                </Button>
              </Upload>
            </div>
          )}
        </div>

        {/* Decorative gradient line */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#3b82f640] to-transparent" />
      </div>
    )
  }, [brands, skinTypes, cosmeticTypes, queryClient])

  const isLoading =
    isLoadingBrands ||
    isLoadingSkinTypes ||
    isLoadingCosmeticTypes

  // Update tableConfig to use new data source
  const tableConfig = {
    columns,
    dataSource: cosmeticsData?.items || [],
    rowKey: 'id',
    pagination: {
      current: currentPage,
      total: cosmeticsData?.totalCount || 0,
      pageSize: 10,
      onChange: (page: number) => {
        setCurrentPage(page)
      },
      className: 'custom-pagination'
    },
    loading: isLoadingCosmetics,
    rowSelection: {
      selectedRowKeys,
      onChange: setSelectedRowKeys
    },
    expandable: {
      expandedRowRender,
      expandRowByClick: false,
      expandIcon: ({ expanded, onExpand, record }) => (
        <motion.div
          initial={false}
          animate={{ rotate: expanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={(e) => {
              e.stopPropagation()
              onExpand(record, e)
            }}
            className="text-gray-400 hover:text-blue-400"
          />
        </motion.div>
      )
    },
    className: 'custom-dark-table'
  }

  const handleMasterCheckboxChange = (e: CheckboxChangeEvent) => {
    setSelectedRowKeys(e.target.checked ? (cosmeticsData?.items || []).map((item) => item.id) : [])
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
            checked={selectedRowKeys.length === cosmeticsData?.items.length}
            indeterminate={
              selectedRowKeys.length > 0 && selectedRowKeys.length < cosmeticsData?.items.length
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

// Add this component for the image upload feature
const ImageUploadButton = ({ onUpload }: { onUpload: (files: RcFile[]) => void }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Upload.Dragger
      name="images"
      multiple
      showUploadList={false}
      beforeUpload={(file) => {
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

        onUpload([file])
        return false
      }}
      className="aspect-square"
    >
      <motion.div
        initial={false}
        animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={`flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-[#1d1f2b] bg-[#1a1b24] transition-colors ${
          isHovered ? 'border-blue-400' : ''
        }`}
      >
        <div className="flex flex-col items-center">
          <InboxOutlined className="mb-2 text-2xl text-gray-400" />
          <p className="text-xs text-gray-400">Click or drag to upload</p>
        </div>
      </motion.div>
    </Upload.Dragger>
  )
}

// Update the ImagesGallery component to only show full-size preview
const ImagesGallery = ({ record, onUpload }: { record: CosmeticDto; onUpload: (files: RcFile[]) => void }) => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
    {/* Upload Button */}
    <ImageUploadButton onUpload={onUpload} />
    
    {/* Existing Images - Simple preview only */}
    {record.cosmeticImages?.map((image) => (
      <div
        key={image.id}
        className="relative aspect-square overflow-hidden rounded-lg border border-[#1d1f2b] bg-[#1a1b24]"
      >
        <Image
          src={image.imageUrl || ''}
          alt="Product image"
          className="size-full cursor-pointer object-cover"
          preview={{
            src: image.imageUrl || '',
            mask: (
              <div className="flex items-center justify-center gap-2">
                <EyeOutlined /> View
              </div>
            )
          }}
        />
      </div>
    ))}
  </div>
)