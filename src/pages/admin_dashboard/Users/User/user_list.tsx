/* eslint-disable tailwindcss/migration-from-tailwind-2 */
import React, { useCallback, useMemo, useRef } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useState } from 'react'
import {
  ConfigProvider,
  Dropdown,
  Button,
  Modal,
  Empty,
  Card,
  Row,
  Col,
  Pagination,
  Spin
} from 'antd'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import 'antd/dist/reset.css'
import {
  SearchOutlined,
  EditOutlined,
  EllipsisOutlined,
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
import { useNavigate } from '@tanstack/react-router'
import { BreadcrumbUpdater } from '@/components/BreadcrumbUpdater'
import { useQuery } from '@tanstack/react-query'

interface UserApiResponse {
  isSuccess: boolean
  data: {
    id: string | null
    userName: string | null
    email: string | null
    phoneNumber: string | null
    birthDate: string | null
    firstName: string | null
    lastName: string | null
    gender: boolean
    roles: string[]
  }[]
  message: string | null
  errors: {
    code: string | null
    description: string | null
  }[]
}

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
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  const [searchText, setSearchText] = useState('')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 16,
    total: 0,
    showSizeChanger: false
  })
  const [selectedUser, setSelectedUser] = useState<DataType | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response: UserApiResponse = await userApi.getUsers(0, 1000)

      if (!response.isSuccess || !response.data) {
        throw new Error(
          response.errors?.[0]?.description || 'Failed to fetch users'
        )
      }

      return response.data
        .filter((user) => user.id && user.userName)
        .map((item) => ({
          id: item.id!,
          username: item.userName!,
          emailConfirmed: Boolean(item.email),
          createdDate: item.birthDate || new Date().toISOString(),
          roles: item.roles,
          key: item.id!,
          avatarUrl: undefined // Add this if you have avatar URLs
        }))
    }
  })

  const filteredData = useMemo(() => {
    if (!usersData) return []
    if (!searchText.trim()) return usersData

    return usersData.filter((item) =>
      Object.entries(item).some(([key, val]) => {
        if (!val) return false
        if (key === 'createdDate' && typeof val === 'string') {
          return format(new Date(val), 'PPp')
            .toLowerCase()
            .includes(searchText.toLowerCase())
        }
        return val.toString().toLowerCase().includes(searchText.toLowerCase())
      })
    )
  }, [usersData, searchText])

  const handleEdit = useCallback(
    (record: DataType) => {
      // @ts-expect-error -- id is not defined in the params
      navigate({ to: '/admin/users/edit/$id', params: { id: record.id } })
    },
    [navigate]
  )

  const handleUserClick = useCallback((user: DataType) => {
    setSelectedUser(user)
    setIsModalVisible(true)
  }, [])

  const handleGlobalSearch = useCallback((value: string) => {
    setSearchText(value)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPagination((prev) => ({ ...prev, current: 1 }))
    }, 300)
  }, [])

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
    const startIndex = (pagination.current - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize
    return filteredData.slice(startIndex, endIndex)
  }

  return (
    <ConfigProvider theme={tableTheme}>
      <BreadcrumbUpdater
        items={['Admin Dashboard', 'Users', 'All Users']}
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
                  onChange={(e) => handleGlobalSearch(e.target.value)}
                  allowClear={{
                    clearIcon: (
                      <CloseOutlined className="text-white hover:text-blue-500" />
                    )
                  }}
                />
              </div>
            </div>
          }
          className="size-full rounded-xl border border-gray-100/10 bg-[#1a1b24] bg-opacity-60 bg-clip-padding backdrop-blur-lg
            transition-all duration-300 hover:border-gray-100/20"
        >
          {isLoading ? (
            <div className="p-12 text-center">
              <Spin size="large" />
            </div>
          ) : !usersData?.length ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-gray-400">No users found</span>
                  </div>
                }
                className="text-gray-400"
              />
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {getCurrentPageData().map((user) => (
                  <Col xs={24} sm={12} md={8} lg={6} xl={6} key={user.id}>
                    <Card
                      hoverable
                      className="group h-full cursor-pointer rounded-lg border-b border-gray-100/10
                        bg-[#1a1b24] transition-all duration-300 hover:bg-[#1E1F2E]"
                      onClick={() => handleUserClick(user)}
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
                              onClick={(e) => e.stopPropagation()}
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
                      {/* Card content */}
                      <div className="flex h-full flex-col items-center text-center">
                        {/* Avatar section */}
                        <div className="relative z-0 mb-3">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.username}
                              className="z-0 size-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex size-12 items-center justify-center rounded-full bg-[#2B2D3A]">
                              <span className="text-xl font-medium text-gray-300">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="absolute -bottom-1.5 -right-1.5 z-50">
                            {user.emailConfirmed ? (
                              <MailFilled
                                className="rounded-full bg-emerald-500/10 p-1.5 text-xl text-emerald-400"
                                style={{ width: '20px', height: '20px' }}
                              />
                            ) : (
                              <StopOutlined
                                className="rounded-full bg-red-500/10 p-1.5 text-xl text-red-400"
                                style={{ width: '20px', height: '20px' }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Username */}
                        <h3 className="mb-1 line-clamp-1 text-[15px] font-medium text-white">
                          {user.username}
                        </h3>

                        {/* Date and Status */}
                        <div className="mb-3 flex items-center justify-center gap-2">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="text-gray-600">Birthdate:</span>
                            {format(new Date(user.createdDate), 'MMM dd, yyyy')}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span
                            className={`text-xs ${
                              user.emailConfirmed
                                ? 'text-emerald-400'
                                : 'text-gray-500'
                            }`}
                          >
                            {user.emailConfirmed ? 'Verified' : 'Unverified'}
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
                                    : role === 'Instructor'
                                      ? 'text-amber-400'
                                      : 'text-blue-400'
                                }
                              `}
                            >
                              {role === 'Admin' ? (
                                <CrownOutlined className="text-xs" />
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

              {/* Pagination */}
              {usersData.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <Pagination
                    current={pagination.current}
                    total={usersData.length}
                    pageSize={pagination.pageSize}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    className="text-gray-400"
                    showTotal={(total, range) =>
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
                className={`flex items-center gap-1 text-sm ${
                  selectedUser.emailConfirmed
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
                    ${
                      role === 'Admin'
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
