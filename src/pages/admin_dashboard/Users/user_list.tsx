import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { useBreadcrumb } from '@/lib/context/BreadcrumbContext'
import {
  ConfigProvider,
  Dropdown,
  Button,
  Modal,
  Empty,
  Card,
  Row,
  Col,
  Pagination
} from 'antd'
import 'antd/dist/reset.css'
import {
  SearchOutlined,
  EditOutlined,
  EllipsisOutlined,
  PlusOutlined,
  CloseOutlined,
  MailFilled,
  CrownOutlined,
  BookOutlined,
  UserOutlined,
  ToolOutlined,
  TeamOutlined,
  ShoppingOutlined
} from '@ant-design/icons'
import { Loader2 } from 'lucide-react'
import { Input } from 'antd'
import userApi from '@/lib/services/userService'
import { useNavigate } from '@tanstack/react-router'
import { BreadcrumbUpdater } from '@/components/BreadcrumbUpdater'
import { useQuery } from '@tanstack/react-query'

// Define types for the API response and user data
interface UserDto {
  id: string
  userName: string
  email: string
  phoneNumber: string
  birthDate: string
  firstName: string
  lastName: string
  gender: boolean
  roles: string[]
}

interface DataType extends UserDto {
  key: string
}

const USERS_QUERY_KEY = ['users'] as const

// Custom hook for debouncing values (search text)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

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
  const { updateBreadcrumb } = useBreadcrumb()
  const [searchText, setSearchText] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState<DataType | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0
  })

  // Set breadcrumb on component mount
  useEffect(() => {
    try {
      if (typeof updateBreadcrumb === 'function') {
        updateBreadcrumb('Admin Dashboard', 'Users')
      }
    } catch (error) {
      console.error('Error updating breadcrumb:', error)
    }

    // Clean up breadcrumb on unmount
    return () => {
      try {
        if (typeof updateBreadcrumb === 'function') {
          updateBreadcrumb('Admin Dashboard')
        }
      } catch (error) {
        console.error('Error resetting breadcrumb:', error)
      }
    }
  }, [updateBreadcrumb])

  // Fetch users data using React Query
  const { data: users = [], isLoading } = useQuery<DataType[], Error>({
    queryKey: USERS_QUERY_KEY,
    queryFn: async () => {
      try {
        const response = await userApi.getUsers(0, 1000)
        console.log('API Response:', response)

        // Handle different possible response formats
        if (Array.isArray(response)) {
          // Direct array response - map it
          return response.map((user) => ({
            ...user,
            key: user.id
          }))
        }

        // Check for response.data
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            // Standard API response with data array
            return response.data.map((user: { id: string | number }) => ({
              ...user,
              key: user.id
            }))
          } else if (
            response.data.items &&
            Array.isArray(response.data.items)
          ) {
            // Response with nested data.items array
            return response.data.items.map((user: { id: string | number }) => ({
              ...user,
              key: user.id
            }))
          }
        }

        console.error('Response data is not an array:', response?.data)
        throw new Error('Invalid response format')
      } catch (err) {
        console.error('Error fetching users:', err)
        throw err
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Handle pagination update in a separate effect
  useEffect(() => {
    if (users.length > 0) {
      setPagination((prev) => ({
        ...prev,
        total: users.length
      }))
    }
  }, [users])

  // Debounce search input to prevent excessive filtering
  const debouncedSearchText = useDebounce(searchText, 300)

  // Filter users based on search text
  const filteredUsers = useMemo(() => {
    if (!debouncedSearchText.trim()) return users || []
    const searchLower = debouncedSearchText.toLowerCase()
    return (users || []).filter(
      (user: {
        userName: string
        email: string
        firstName: string
        lastName: string
      }) =>
        (user.userName?.toLowerCase() || '').includes(searchLower) ||
        (user.email?.toLowerCase() || '').includes(searchLower) ||
        (user.firstName?.toLowerCase() || '').includes(searchLower) ||
        (user.lastName?.toLowerCase() || '').includes(searchLower) ||
        ((user.firstName || '') + ' ' + (user.lastName || ''))
          .toLowerCase()
          .includes(searchLower)
    )
  }, [users, debouncedSearchText])

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const { current, pageSize } = pagination
    const startIndex = (current - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredUsers.slice(startIndex, endIndex)
  }, [filteredUsers, pagination])

  // User edit mutation

  // Handler functions
  const handleEdit = useCallback(
    (user: DataType) => {
      navigate({
        to: `/admin/users/edit/${user.id}`,
        params: { userId: user.id }
      })
    },
    [navigate]
  )

  const handleAdd = useCallback(() => {
    navigate({ to: '/admin/users/$userId', params: { userId: 'new' } })
  }, [navigate])

  const handleSearch = useCallback((value: string) => {
    setSearchText(value)
    setPagination((prev) => ({ ...prev, current: 1 }))
  }, [])

  const handlePageChange = useCallback((page: number, pageSize?: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize
    }))
  }, [])

  const handleViewDetails = useCallback((user: DataType) => {
    setSelectedUser(user)
    setModalVisible(true)
  }, [])

  // Handle card click
  const handleCardClick = useCallback(
    (user: DataType) => {
      handleViewDetails(user)
    },
    [handleViewDetails]
  )

  // Get current page data function
  const getCurrentPageData = useCallback(() => {
    return paginatedData
  }, [paginatedData])

  // Handle global search (this was missing)
  const handleGlobalSearch = useCallback(
    (value: string) => {
      handleSearch(value)
    },
    [handleSearch]
  )

  // Create menu for dropdown actions

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
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="mx-auto size-8 animate-spin text-blue-500" />
            </div>
          ) : filteredUsers.length === 0 ? (
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
              <Row gutter={[16, 16]}>
                {getCurrentPageData().map((user: DataType) => (
                  <Col xs={24} sm={12} md={8} lg={6} xl={6} key={user.id}>
                    <Card
                      hoverable
                      className={`
                        group h-full cursor-pointer rounded-lg border-b border-gray-100/10
                        bg-[#1a1b24] transition-all duration-300 hover:bg-[#1E1F2E]
                      `}
                      onClick={() => handleCardClick(user)}
                      extra={
                        <div className="absolute right-4 top-4">
                          <Dropdown
                            menu={{
                              items: [
                                {
                                  key: 'edit',
                                  icon: <EditOutlined />,
                                  label: 'Edit',
                                  onClick: () => handleEdit(user)
                                }
                              ]
                            }}
                            trigger={['click']}
                            placement="bottomRight"
                          >
                            <Button
                              type="text"
                              icon={<EllipsisOutlined />}
                              className="text-gray-500 hover:text-gray-400"
                              onClick={(e: React.MouseEvent) =>
                                e.stopPropagation()
                              }
                            />
                          </Dropdown>
                        </div>
                      }
                      bodyStyle={{
                        padding: '24px',
                        height: '100%',
                        position: 'relative'
                      }}
                      headStyle={{ display: 'none' }}
                    >
                      <div className="flex h-full flex-col items-center text-center">
                        {/* Avatar - using initials since API doesn't return avatarUrl */}
                        <div className="relative z-0 mb-3">
                          <div className="flex size-12 items-center justify-center rounded-full bg-[#2B2D3A]">
                            <span className="text-xl font-medium text-gray-300">
                              {user.firstName?.charAt(0)?.toUpperCase() ||
                                user.userName?.charAt(0)?.toUpperCase() ||
                                '?'}
                            </span>
                          </div>
                          <div className="absolute -bottom-1.5 -right-1.5 z-50">
                            <MailFilled
                              className="rounded-full bg-emerald-500/10 p-1.5 text-xl text-emerald-400"
                              style={{ width: '20px', height: '20px' }}
                            />
                          </div>
                        </div>

                        {/* Username */}
                        <h3 className="mb-1 line-clamp-1 text-[15px] font-medium text-white">
                          {user.userName}
                        </h3>

                        {/* Email and Full Name */}
                        <div className="mb-3 flex items-center justify-center gap-2">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="text-gray-600">Email:</span>
                            {user.email}
                          </span>
                        </div>

                        <div className="mb-3 flex items-center justify-center gap-2">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="text-gray-600">Name:</span>
                            {`${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                              'Not provided'}
                          </span>
                        </div>

                        {/* Roles */}
                        <div className="flex flex-wrap justify-center gap-2">
                          {user.roles.map((role, index) => (
                            <span
                              key={index}
                              className={`
                                flex items-center gap-1 text-xs font-medium
                                ${
                                  role === 'Admin'
                                    ? 'text-rose-400'
                                    : role === 'Manager'
                                      ? 'text-amber-400'
                                      : role === 'Staff'
                                        ? 'text-blue-400'
                                        : role === 'Customer'
                                          ? 'text-emerald-400'
                                          : role === 'Instructor'
                                            ? 'text-purple-400'
                                            : 'text-gray-400'
                                }
                              `}
                            >
                              {role === 'Admin' ? (
                                <CrownOutlined className="text-xs" />
                              ) : role === 'Manager' ? (
                                <TeamOutlined className="text-xs" />
                              ) : role === 'Staff' ? (
                                <ToolOutlined className="text-xs" />
                              ) : role === 'Customer' ? (
                                <ShoppingOutlined className="text-xs" />
                              ) : role === 'Instructor' ? (
                                <BookOutlined className="text-xs" />
                              ) : (
                                <UserOutlined className="text-xs" />
                              )}
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>

              {filteredUsers.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <Pagination
                    current={pagination.current}
                    total={filteredUsers.length}
                    pageSize={pagination.pageSize}
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
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
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
              <div className="flex size-20 items-center justify-center rounded-full bg-[#2B2D3A]">
                <span className="text-3xl font-medium text-gray-300">
                  {selectedUser.firstName?.charAt(0)?.toUpperCase() ||
                    selectedUser.userName?.charAt(0)?.toUpperCase() ||
                    '?'}
                </span>
              </div>
              <div className="absolute -bottom-1.5 -right-1.5">
                <MailFilled
                  className="rounded-full bg-emerald-500/10 p-1.5 text-xl text-emerald-400"
                  style={{ width: '24px', height: '24px' }}
                />
              </div>
            </div>

            {/* Username */}
            <h2 className="mb-2 text-xl font-semibold text-white">
              {selectedUser.userName}
            </h2>

            {/* Email */}
            <div className="mb-4 flex items-center gap-2">
              <span className="flex items-center gap-1 text-sm text-gray-400">
                <span className="text-gray-500">Email:</span>
                {selectedUser.email}
              </span>
            </div>

            {/* Full Name */}
            <div className="mb-4 flex items-center gap-2">
              <span className="flex items-center gap-1 text-sm text-gray-400">
                <span className="text-gray-500">Full Name:</span>
                {`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() ||
                  'Not provided'}
              </span>
            </div>

            {/* Phone */}
            {selectedUser.phoneNumber && (
              <div className="mb-4 flex items-center gap-2">
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <span className="text-gray-500">Phone:</span>
                  {selectedUser.phoneNumber}
                </span>
              </div>
            )}

            {/* Roles */}
            <div className="flex flex-wrap justify-center gap-2">
              {selectedUser.roles.map((role, index) => (
                <span
                  key={index}
                  className={`
                    flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium
                    ${
                      role === 'Admin'
                        ? 'bg-rose-500/10 text-rose-400'
                        : role === 'Manager'
                          ? 'bg-amber-500/10 text-amber-400'
                          : role === 'Staff'
                            ? 'bg-blue-500/10 text-blue-400'
                            : role === 'Customer'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : role === 'Instructor'
                                ? 'bg-purple-500/10 text-purple-400'
                                : 'bg-gray-500/10 text-gray-400'
                    }
                  `}
                >
                  {role === 'Admin' ? (
                    <CrownOutlined className="text-sm" />
                  ) : role === 'Manager' ? (
                    <TeamOutlined className="text-sm" />
                  ) : role === 'Staff' ? (
                    <ToolOutlined className="text-sm" />
                  ) : role === 'Customer' ? (
                    <ShoppingOutlined className="text-sm" />
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
                  setModalVisible(false)
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
