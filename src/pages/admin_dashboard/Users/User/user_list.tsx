/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useMemo, useRef } from 'react'
// @ts-expect-error -- expected
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useBreadcrumb } from '@/contexts/BreadcrumbContext'
import { useEffect, useState } from 'react'
import {
  ConfigProvider,
  Dropdown,
  Button,
  Modal,
  message,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Tooltip,
  Badge,
  Empty,
  Card,
  Row,
  Col,
  Pagination,
  Spin
} from 'antd'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ColumnType } from 'antd/es/table'
import 'antd/dist/reset.css'
import {
  SearchOutlined,
  EditOutlined,
  EllipsisOutlined,
  PlusOutlined,
  CloseOutlined,
  MailFilled,
  StopOutlined,
  CrownOutlined,
  BookOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Input } from 'antd'
import userApi from '@/lib/services/userService'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useLoading } from '@/lib/context/LoadingContext'
import { BreadcrumbUpdater } from '@/components/BreadcrumbUpdater'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

interface UserDto {
  id: string
  username: string
  createdDate: string
  emailConfirmed: boolean
  roles: string[]
  avatarUrl?: string
}

interface DataType extends UserDto {
  key: string
}

const MemoizedHighlightText = React.memo(
  ({ text, searchText }: { text: string; searchText: string }) => {
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
)
MemoizedHighlightText.displayName = 'MemoizedHighlightText'

const tableTheme = {
  components: {
    Table: {
      headerBg: '#282d35',
      headerColor: '#8b949e',
      bodySortBg: '#282d35',
      borderColor: '#30363d',
      rowHoverBg: '#2c333a',
      rowSelectedBg: '#2c333a',
      rowSelectedHoverBg: '#2c333a',
      headerSortActiveBg: '#282d35',
      headerSortHoverBg: '#282d35',
      filterDropdownBg: '#282d35',
      filterDropdownMenuBg: '#282d35',
      cellPaddingBlock: 8,
      cellPaddingInline: 32,
      selectionColumnWidth: 48,
      headerBorderRadius: 8,
      borderRadius: 8,
      padding: 24,
      headerSplitColor: 'transparent',
      colorBgTextHover: 'transparent',
      colorBgTextActive: 'transparent',
      colorTextPlaceholder: '#ffffff',
      colorBgContainer: '#282d35'
    },
    Empty: {
      colorText: '#ffffff',
      colorTextDisabled: '#ffffff',
      colorFill: '#ffffff',
      colorFillSecondary: '#ffffff',
      colorFillQuaternary: '#ffffff',
      colorIcon: '#ffffff',
      colorIconHover: '#ffffff'
    },
    Input: {
      colorBgContainer: '#282d35',
      colorBorder: '#30363d',
      colorText: '#ffffff',
      colorTextPlaceholder: '#8b949e',
      colorIcon: '#ffffff',
      colorIconHover: '#3b82f6'
    },
    Button: {
      colorPrimary: '#dc2626',
      colorPrimaryHover: '#b91c1c',
      colorPrimaryActive: '#991b1b',
      primaryColor: '#ffffff',
      colorBgContainer: '#282d35',
      colorBorder: '#30363d',
      colorText: '#8b949e',
      defaultBg: '#1a1b24',
      defaultColor: '#6b7280',
      defaultBorderColor: '#374151',
      defaultHoverBg: '#282c34',
      defaultHoverColor: '#9ca3af',
      defaultHoverBorderColor: '#4b5563',
      primaryBg: '#3b82f6',
      primaryHoverBg: '#2563eb',
      dangerBg: '#dc2626',
      dangerHoverBg: '#b91c1c'
    },
    Checkbox: {
      colorBgContainer: '#282d35',
      colorBorder: '#8b949e',
      colorText: '#8b949e',
      lineWidth: 1.5,
      borderRadius: 2,
      colorPrimary: '#1890ff',
      controlInteractiveSize: 16
    },
    Dropdown: {
      colorBgElevated: '#282d35',
      controlItemBgHover: '#363b42',
      colorText: '#8b949e'
    },
    Card: {
      headerBg: '#1a1b24',
      headerBorderBottom: 'none',
      colorBorderSecondary: 'transparent'
    },
    Modal: {
      contentBg: '#1a1b24',
      headerBg: '#1a1b24',
      titleColor: '#ffffff',
      borderRadiusOuter: 12,
      paddingContentHorizontalLG: 0,
      boxShadow: 'none',
      colorIcon: '#6b7280',
      colorIconHover: '#9ca3af',
      footerBg: '#1a1b24'
    }
  },
  token: {
    colorBgContainer: '#282d35',
    colorText: '#ffffff',
    borderRadius: 8,
    padding: 24,
    colorTextDisabled: '#ffffff'
  }
} as const

export default function Users() {
  const navigate = useNavigate()
  const { startLoading, stopLoading } = useLoading()

  const loadingRef = useRef(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<DataType[]>([])
  const [searchText, setSearchText] = useState('')
  const [originalData, setOriginalData] = useState<DataType[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 16,
    total: 0,
    showSizeChanger: false
  })
  const [selectedUser, setSelectedUser] = useState<DataType | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const columnHelper = createColumnHelper<DataType>()

  const handleEdit = useCallback(
    (record: DataType) => {
      navigate(`/admin/users/edit/${record.id}`)
    },
    [navigate]
  )

  const handleUserClick = useCallback((user: DataType) => {
    setSelectedUser(user)
    setIsModalVisible(true)
  }, [])

  const columns = useMemo<ColumnDef<DataType, any>[]>(
    () => [
      columnHelper.accessor('username', {
        header: 'Username',
        cell: (info) => (
          <MemoizedHighlightText
            text={info.getValue()}
            searchText={searchText}
          />
        ),
        sortingFn: 'alphanumeric'
      }),
      columnHelper.accessor('emailConfirmed', {
        header: 'Email Status',
        cell: (info) => (
          <Badge
            status={info.getValue() ? 'success' : 'error'}
            text={info.getValue() ? 'Confirmed' : 'Unconfirmed'}
          />
        ),
        filterFn: (row, _columnId, value) => {
          return row.original.emailConfirmed === value
        }
      }),
      columnHelper.accessor('createdDate', {
        header: 'Created Date',
        cell: (info) => {
          const formattedDate = format(new Date(info.getValue()), 'PPp')
          return (
            <MemoizedHighlightText
              text={formattedDate}
              searchText={searchText}
            />
          )
        },
        sortingFn: 'datetime'
      }),
      columnHelper.accessor('roles', {
        header: 'Roles',
        cell: (info) => (
          <div className="flex flex-wrap gap-1">
            {info
              .getValue()
              .map(
                (
                  role:
                    | string
                    | number
                    | boolean
                    | React.ReactElement<
                      any,
                      string | React.JSXElementConstructor<any>
                    >
                    | Iterable<React.ReactNode>
                    | React.ReactPortal
                    | null
                    | undefined,
                  index: React.Key | null | undefined
                ) => (
                  <Badge
                    key={index}
                    count={role}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      borderRadius: '12px',
                      padding: '0 8px'
                    }}
                  />
                )
              )}
          </div>
        ),
        filterFn: (row, _columnId, value) => {
          return row.original.roles.includes(value as string)
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-gray-400 hover:text-blue-400"
            onClick={() => handleEdit(info.row.original)}
          />
        )
      })
    ],
    [searchText, handleEdit, handleUserClick]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  })

  const fetchData = useCallback(async () => {
    if (loadingRef.current) return

    try {
      loadingRef.current = true
      setLoading(true)
      startLoading()

      // Get all users with a large page size
      const response = await userApi.getUsers(0, 1000)

      if (!response || !response.items) {
        console.error('Invalid response format:', response)
        return
      }

      const transformedData = response.items.map((item) => ({
        ...item,
        key: item.id
      }))


      setData(transformedData)
      setOriginalData(transformedData)
      setPagination((prev) => ({
        ...prev,
        total: transformedData.length,
        current: 1
      }))
    } catch (error) {
      console.error('Error fetching users:', error)
      message.error('Failed to fetch users')
    } finally {
      loadingRef.current = false
      setLoading(false)
      stopLoading()
    }
  }, [startLoading, stopLoading])

  const handleAdd = useCallback(() => {
    navigate('/admin/users/add')
  }, [navigate])

  const handleGlobalSearch = useCallback(
    (value: string) => {
      setSearchText(value)

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (!value.trim()) {
          setData(originalData)
          return
        }

        const filteredData = originalData.filter((item) =>
          Object.entries(item).some(([key, val]) => {
            if (!val) return false
            if (key === 'createdDate') {
              return format(new Date(val), 'PPp')
                .toLowerCase()
                .includes(value.toLowerCase())
            }
            return val.toString().toLowerCase().includes(value.toLowerCase())
          })
        )
        setData(filteredData)
      }, 300)
    },
    [originalData]
  )

  useEffect(() => {
    console.log('Initial fetch')
    fetchData()
  }, [fetchData])

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, current: page }))
  }

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const getCurrentPageData = () => {
    const startIndex = (pagination.current - 1) * 16
    const endIndex = startIndex + 16
    return data.slice(startIndex, endIndex)
  }

  return (
    <ConfigProvider theme={tableTheme}>
      <BreadcrumbUpdater
        items={['Admin Dashboard', 'Users']}
        previousItems={['Admin Dashboard']}
      />
      <div className="mx-auto mt-32 w-4/5">
        <Card
          title={
            <div className="my-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#282d35] p-2">
                  <UserOutlined className="text-blue-400" />
                </div>
                <span className="text-lg font-semibold text-white">
                  User List
                </span>
              </div>
              <div className="mx-8 flex flex-1 items-center gap-3">
                <Input

                  prefix={<SearchOutlined className="text-[#8b949e]" />}
                  placeholder="Smart Search..."
                  className="w-full bg-[#282d35]"
                  value={searchText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleGlobalSearch(e.target.value)
                  }
                  allowClear={{
                    clearIcon: (
                      <CloseOutlined className="text-white hover:text-blue-500" />
                    )
                  }}
                />
              </div>
              <div className="flex items-center gap-3">

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                  className="whitespace-nowrap bg-blue-500 shadow-none hover:bg-blue-600"
                  style={{ boxShadow: 'none' }}
                >
                  Add User
                </Button>
              </div>
            </div>
          }
          className="size-full rounded-xl border border-gray-100/10 bg-[#1a1b24] bg-opacity-60 bg-clip-padding backdrop-blur-lg
            transition-all duration-300 hover:border-gray-100/20"
        >
          {loading ? (
            <div className="p-12 text-center">
              <Spin size="large" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-gray-400">No users found</span>

                    <Button
                      type="primary"
                      onClick={handleAdd}
                      icon={<PlusOutlined />}
                      className="mt-4 bg-blue-500 hover:bg-blue-600"
                    >
                      Add First User
                    </Button>
                  </div>
                }
                className="text-gray-400"
              />
            </div>
          ) : (
            <>
              <table>
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <Pagination
                    current={pagination.current}
                    total={data.length}
                    pageSize={16}
                    onChange={handlePageChange}
                    showSizeChanger={false}

                    className="text-gray-400"
                    showTotal={(total: number, range: number[]) =>
                      `${range[0]}-${range[1]} of ${total} items`
                    }
                    hideOnSinglePage={false}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      </div>


      <Modal
        title={null}
        open={isModalVisible}
        footer={null}
        onCancel={() => setIsModalVisible(false)}
        width={400}
        centered
        classNames={{
          content: 'border border-gray-100/10',
          body: 'p-0'
        }}
      >
        {selectedUser && (
          <div className="flex flex-col items-center p-6">
            {/* Avatar */}
            <div className="relative mb-6">
              {selectedUser.avatarUrl ? (
                <img
                  src={selectedUser.avatarUrl}
                  alt={selectedUser.username}
                  className="size-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-full bg-[#2B2D3A]">
                  <span className="text-3xl font-medium text-gray-300">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1.5 -right-1.5">
                {selectedUser.emailConfirmed ? (
                  <MailFilled
                    className="rounded-full bg-emerald-500/10 p-1.5 text-xl text-emerald-400"
                    style={{ width: '24px', height: '24px' }}
                  />
                ) : (
                  <StopOutlined
                    className="rounded-full bg-red-500/10 p-1.5 text-xl text-red-400"
                    style={{ width: '24px', height: '24px' }}
                  />
                )}
              </div>
            </div>

            {/* Username */}
            <h2 className="mb-2 text-xl font-semibold text-white">
              {selectedUser.username}
            </h2>

            {/* Date and Status */}
            <div className="mb-4 flex items-center gap-2">
              <span className="flex items-center gap-1 text-sm text-gray-400">
                <span className="text-gray-500">Created:</span>
                {format(new Date(selectedUser.createdDate), 'PPP')}
              </span>
              <span className="text-gray-500">•</span>
              <span
                className={`flex items-center gap-1 text-sm ${selectedUser.emailConfirmed
                  ? 'text-emerald-400'
                  : 'text-red-400'
                  }`}
              >
                {selectedUser.emailConfirmed ? (
                  <>
                    <MailFilled className="text-sm" /> Verified
                  </>
                ) : (
                  <>
                    <StopOutlined className="text-sm" /> Unverified
                  </>
                )}
              </span>
            </div>

            {/* Roles */}
            <div className="flex flex-wrap justify-center gap-2">
              {selectedUser.roles.map((role, index) => (
                <span
                  key={index}
                  className={`
                    flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium
                    ${role === 'Admin'
                      ? 'bg-rose-500/10 text-rose-400'
                      : role === 'Instructor'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-blue-500/10 text-blue-400'
                    }
                  `}
                >
                  {role === 'Admin' ? (
                    <CrownOutlined className="text-sm" />
                  ) : role === 'Instructor' ? (
                    <BookOutlined className="text-sm" />
                  ) : (
                    <UserOutlined className="text-sm" />
                  )}
                  {role}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">

              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()

                  handleEdit(selectedUser)
                  setIsModalVisible(false)
                }}
                className="flex items-center gap-2 border-none !bg-amber-500/10 !text-amber-400 shadow-none hover:!bg-amber-500/20"
                style={{ boxShadow: 'none' }}
              >
                Edit
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </ConfigProvider>
  )
}
