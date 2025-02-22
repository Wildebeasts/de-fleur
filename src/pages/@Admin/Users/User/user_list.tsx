import React, { useCallback, useMemo, useRef } from "react";
// @ts-expect-error -- expected
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import { useEffect, useState } from "react";
import {
  // @ts-expect-error -- expected
  ConfigProvider,
  Dropdown,
  Button,
  Modal,
  message,
  // @ts-expect-error -- expected
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Tooltip,
  Badge,
  // @ts-expect-error -- expected
  Empty,
  // @ts-expect-error -- expected
  Card,
  Row,
  Col,
  Pagination,
  Spin,
} from "antd";
// @ts-expect-error -- expected
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ColumnType } from "antd/es/table";
import "antd/dist/reset.css";
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
  UserOutlined,
} from "@ant-design/icons";
import { Input } from "antd";
import userApi from "@/utils/services/UserService";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useLoading } from '@/contexts/LoadingContext';
import { BreadcrumbUpdater } from "@/components/BreadcrumbUpdater";

interface UserDto {
  id: string;
  username: string;
  createdDate: string;
  emailConfirmed: boolean;
  roles: string[];
  avatarUrl?: string;
}

interface DataType extends UserDto {
  key: string;
}

const MemoizedHighlightText = React.memo(({
  text,
  searchText,
}: {
  text: string;
  searchText: string;
}) => {
  if (!searchText || !text) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${searchText})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === searchText.toLowerCase() ? (
          <span key={i} className="bg-yellow-500/30">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
});

const tableTheme = {
  components: {
    Table: {
      headerBg: "#282d35",
      headerColor: "#8b949e",
      bodySortBg: "#282d35",
      borderColor: "#30363d",
      rowHoverBg: "#2c333a",
      rowSelectedBg: "#2c333a",
      rowSelectedHoverBg: "#2c333a",
      headerSortActiveBg: "#282d35",
      headerSortHoverBg: "#282d35",
      filterDropdownBg: "#282d35",
      filterDropdownMenuBg: "#282d35",
      cellPaddingBlock: 8,
      cellPaddingInline: 32,
      selectionColumnWidth: 48,
      headerBorderRadius: 8,
      borderRadius: 8,
      padding: 24,
      headerSplitColor: "transparent",
      colorBgTextHover: "transparent",
      colorBgTextActive: "transparent",
      colorTextPlaceholder: "#ffffff",
      colorBgContainer: "#282d35",
    },
    Empty: {
      colorText: "#ffffff",
      colorTextDisabled: "#ffffff",
      colorFill: "#ffffff",
      colorFillSecondary: "#ffffff",
      colorFillQuaternary: "#ffffff",
      colorIcon: "#ffffff",
      colorIconHover: "#ffffff",
    },
    Input: {
      colorBgContainer: "#282d35",
      colorBorder: "#30363d",
      colorText: "#ffffff",
      colorTextPlaceholder: "#8b949e",
      colorIcon: "#ffffff",
      colorIconHover: "#3b82f6",
    },
    Button: {
      colorPrimary: "#dc2626",
      colorPrimaryHover: "#b91c1c",
      colorPrimaryActive: "#991b1b",
      primaryColor: "#ffffff",
      colorBgContainer: "#282d35",
      colorBorder: "#30363d",
      colorText: "#8b949e",
      defaultBg: '#1a1b24',
      defaultColor: '#6b7280',
      defaultBorderColor: '#374151',
      defaultHoverBg: '#282c34',
      defaultHoverColor: '#9ca3af',
      defaultHoverBorderColor: '#4b5563',
      primaryBg: '#3b82f6',
      primaryHoverBg: '#2563eb',
      dangerBg: '#dc2626',
      dangerHoverBg: '#b91c1c',
    },
    Checkbox: {
      colorBgContainer: "#282d35",
      colorBorder: "#8b949e",
      colorText: "#8b949e",
      lineWidth: 1.5,
      borderRadius: 2,
      colorPrimary: "#1890ff",
      controlInteractiveSize: 16,
    },
    Dropdown: {
      colorBgElevated: "#282d35",
      controlItemBgHover: "#363b42",
      colorText: "#8b949e",
    },
    Card: {
      headerBg: '#1a1b24',
      headerBorderBottom: 'none',
      colorBorderSecondary: 'transparent',
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
      footerBg: '#1a1b24',
    },
  },
  token: {
    colorBgContainer: "#282d35",
    colorText: "#ffffff",
    borderRadius: 8,
    padding: 24,
    colorTextDisabled: "#ffffff",
  },
} as const;

export default function Users() {
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();
  
  const loadingRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataType[]>([]);
  const [searchText, setSearchText] = useState("");
  const [originalData, setOriginalData] = useState<DataType[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 16,
    total: 0,
    showSizeChanger: false,
  });
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchData = useCallback(async () => {
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      startLoading();

      // Get all users with a large page size
      const response = await userApi.getUsers(0, 1000);
      
      if (!response || !response.items) {
        console.error('Invalid response format:', response);
        return;
      }

      const transformedData = response.items.map((item) => ({
        ...item,
        key: item.id,
      }));
      
      // @ts-expect-error -- expected
      setData(transformedData);
      // @ts-expect-error -- expected
      setOriginalData(transformedData);
      setPagination(prev => ({
        ...prev,
        total: transformedData.length,
        current: 1,
      }));

    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to fetch users");
    } finally {
      loadingRef.current = false;
      setLoading(false);
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  const handleEdit = useCallback((record: DataType) => {
    navigate(`/admin/users/edit/${record.id}`);
  }, [navigate]);

  const handleAdd = useCallback(() => {
    navigate("/admin/users/add");
  }, [navigate]);

  const handleGlobalSearch = useCallback((value: string) => {
    setSearchText(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (!value.trim()) {
        setData(originalData);
        return;
      }

      const filteredData = originalData.filter((item) =>
        Object.entries(item).some(([key, val]) => {
          if (!val) return false;
          if (key === "createdDate") {
            return format(new Date(val), "PPp")
              .toLowerCase()
              .includes(value.toLowerCase());
          }
          return val.toString().toLowerCase().includes(value.toLowerCase());
        })
      );
      setData(filteredData);
    }, 300);
  }, [originalData]);

  const columns = useMemo(() => [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      // @ts-expect-error -- expected
      sorter: (a, b) => a.username.localeCompare(b.username),
      defaultSortOrder: "ascend",
      render: (text: string) => (
        <MemoizedHighlightText text={text} searchText={searchText} />
      ),
    },
    {
      title: "Email Status",
      dataIndex: "emailConfirmed",
      key: "emailConfirmed",
      width: 120,
      render: (confirmed: boolean) => (
        <Badge
          // @ts-expect-error -- expected
          status={confirmed ? "success" : "error"}
          text={confirmed ? "Confirmed" : "Unconfirmed"}
        />
      ),
      filters: [
        { text: "Confirmed", value: true },
        { text: "Unconfirmed", value: false },
      ],
      // @ts-expect-error -- expected
      onFilter: (value, record) => record.emailConfirmed === value,
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      align: "right",
      width: 200,
      render: (text: string) => {
        const formattedDate = format(new Date(text), "PPp");
        return <MemoizedHighlightText text={formattedDate} searchText={searchText} />;
      },
      // @ts-expect-error -- expected
      sorter: (a, b) => {
        const dateA = a?.createdDate || "";
        const dateB = b?.createdDate || "";
        return dateA.localeCompare(dateB);
      },
    },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      width: 200,
      render: (roles: string[]) => (
        <div className="flex flex-wrap gap-1">
          {roles.map((role, index) => (
            <Badge
              key={index}
              // @ts-expect-error -- expected
              count={role}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '12px',
                padding: '0 8px',
              }}
            />
          ))}
        </div>
      ),
      filters: [
        { text: "Admin", value: "Admin" },
        { text: "Instructor", value: "Instructor" },
        { text: "Student", value: "Student" },
      ],
      onFilter: (value: string, record: DataType) => 
        record.roles.includes(value),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 80,
      align: "center",
      render: (_: unknown, record: unknown) => (
        <Button
          type="text" 
          // @ts-expect-error -- expected
          icon={<EditOutlined />}
          className="text-gray-400 hover:text-blue-400"
          onClick={() => handleEdit(record as DataType)}
        />
      ),
    },
  ], [searchText, handleEdit]);

  // @ts-expect-error -- expected
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tableConfig = useMemo(() => ({
    columns,
    dataSource: data,
    loading,
    rowSelection: {
      type: "checkbox" as const,
      selectedRowKeys: [],
      // @ts-expect-error -- expected
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onChange: (selectedRowKeys: React.Key[]) => {
        // Handle selection change if needed
      },
      columnTitle: "",
      columnWidth: 48,
      hideSelectAll: true,
    },
    pagination: {
      pageSize: 16,
      showSizeChanger: false,
    },
    scroll: { y: 600 },
    size: "middle" as const,
  }), [columns, data, loading]);

  useEffect(() => {
    console.log('Initial fetch');
    fetchData();
  }, [fetchData]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleCardClick = (user: UserDto) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const getCurrentPageData = () => {
    const startIndex = (pagination.current - 1) * 16;
    const endIndex = startIndex + 16;
    return data.slice(startIndex, endIndex);
  };

  return (
    <ConfigProvider theme={tableTheme}>
      <BreadcrumbUpdater 
        items={["Admin Dashboard", "Users"]}
        previousItems={["Admin Dashboard"]}
      />
      <div className="w-[80%] mx-auto mt-[8rem]">
        <Card
          title={
            <div className="flex items-center justify-between my-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#282d35]">
                  <UserOutlined className="text-blue-400" />
                </div>
                <span className="text-lg font-semibold text-white">
                  User List
                </span>
              </div>
              <div className="flex items-center gap-3 flex-1 mx-8">
                <Input
                  // @ts-expect-error -- expected
                  prefix={<SearchOutlined className="text-[#8b949e]" />}
                  placeholder="Smart Search..."
                  className="w-full bg-[#282d35]"
                  value={searchText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleGlobalSearch(e.target.value)}
                  allowClear={{
                    clearIcon: <CloseOutlined className="text-white hover:text-blue-500" />
                  }}
                />
              </div>
              <div className="flex items-center gap-3">
                {/* @ts-expect-error -- expected */}
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                  className="bg-blue-500 hover:bg-blue-600 whitespace-nowrap shadow-none"
                  style={{ boxShadow: 'none' }}
                >
                  Add User
                </Button>
              </div>
            </div>
          }
          className="h-full w-full bg-[#1a1b24] rounded-xl bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-60 
            border border-gray-100/10 hover:border-gray-100/20 transition-all duration-300"
        >
          {loading ? (
            <div className="text-center p-12">
              <Spin size="large" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-gray-400">
                      No users found
                    </span>
                    {/* @ts-expect-error -- expected */}
                    <Button
                      type="primary"
                      onClick={handleAdd}
                      icon={<PlusOutlined />}
                      className="bg-blue-500 hover:bg-blue-600 mt-4"
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
              {/* @ts-expect-error -- expected */}
              <Row gutter={[16, 16]}>
                {getCurrentPageData().map((user) => (
                  // @ts-expect-error -- expected
                  <Col xs={24} sm={12} md={8} lg={6} xl={6} key={user.id}>
                    <Card
                      hoverable
                      className={`
                        group h-full bg-[#1a1b24] rounded-lg border-b border-gray-100/10
                        hover:bg-[#1E1F2E] transition-all duration-300 cursor-pointer
                      `}
                      onClick={() => handleCardClick(user)}
                      extra={
                        <div className="absolute top-4 right-4">
                          {/* @ts-expect-error -- expected */}
                          <Dropdown
                            menu={{
                              items: [
                                {
                                  key: "edit",
                                  icon: <EditOutlined />,
                                  label: "Edit",
                                  onClick: () => handleEdit(user),
                                },
                              ],
                            }}
                            trigger={["click"]}
                            placement="bottomRight"
                          >
                            <Button
                              type="text"
                              // @ts-expect-error -- expected
                              icon={<EllipsisOutlined />}
                              className="text-gray-500 hover:text-gray-400"
                              onClick={(e: React.MouseEvent) => e.stopPropagation()}
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
                      <div className="flex flex-col items-center text-center h-full">
                        {/* Avatar */}
                        <div className="relative mb-3 z-0">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.username}
                              className="w-12 h-12 rounded-full object-cover z-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-[#2B2D3A] flex items-center justify-center">
                              <span className="text-xl font-medium text-gray-300">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="absolute -bottom-1.5 -right-1.5 z-50">
                            {user.emailConfirmed ? (
                              <MailFilled 
                                className="text-emerald-400 text-xl bg-emerald-500/10 p-1.5 rounded-full"
                                style={{ width: '20px', height: '20px' }}
                              />
                            ) : (
                              <StopOutlined 
                                className="text-red-400 text-xl bg-red-500/10 p-1.5 rounded-full"
                                style={{ width: '20px', height: '20px' }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Username */}
                        <h3 className="text-[15px] font-medium text-white mb-1 line-clamp-1">
                          {user.username}
                        </h3>

                        {/* Date and Status */}
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="text-gray-600">Created:</span>
                            {format(new Date(user.createdDate), "MMM dd, yyyy")}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className={`text-xs ${
                            user.emailConfirmed 
                              ? 'text-emerald-400' 
                              : 'text-gray-500'
                          }`}>
                            {user.emailConfirmed ? 'Verified' : 'Unverified'}
                          </span>
                        </div>

                        {/* Roles */}
                        <div className="flex flex-wrap justify-center gap-2">
                          {user.roles.map((role, index) => (
                            <span
                              key={index}
                              className={`
                                text-xs font-medium flex items-center gap-1
                                ${role === 'Admin' 
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

              {data.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <Pagination
                    current={pagination.current}
                    total={data.length}
                    pageSize={16}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    // @ts-expect-error -- expected
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

      {/* @ts-expect-error -- expected */}
      <Modal
        title={null}
        open={isModalVisible}
        footer={null}
        onCancel={() => setIsModalVisible(false)}
        width={400}
        centered
        classNames={{
          content: "border border-gray-100/10",
          body: "p-0",
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
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#2B2D3A] flex items-center justify-center">
                  <span className="text-3xl font-medium text-gray-300">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1.5 -right-1.5">
                {selectedUser.emailConfirmed ? (
                  <MailFilled 
                    className="text-emerald-400 text-xl bg-emerald-500/10 p-1.5 rounded-full"
                    style={{ width: '24px', height: '24px' }}
                  />
                ) : (
                  <StopOutlined 
                    className="text-red-400 text-xl bg-red-500/10 p-1.5 rounded-full"
                    style={{ width: '24px', height: '24px' }}
                  />
                )}
              </div>
            </div>

            {/* Username */}
            <h2 className="text-xl font-semibold text-white mb-2">
              {selectedUser.username}
            </h2>

            {/* Date and Status */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-400 flex items-center gap-1">
                <span className="text-gray-500">Created:</span>
                {format(new Date(selectedUser.createdDate), "PPP")}
              </span>
              <span className="text-gray-500">•</span>
              <span className={`text-sm flex items-center gap-1 ${
                selectedUser.emailConfirmed 
                  ? 'text-emerald-400' 
                  : 'text-red-400'
              }`}>
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
                    px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2
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
            <div className="flex gap-3 mt-6">
              {/* @ts-expect-error -- expected */}
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  // @ts-expect-error -- expected
                  handleEdit(selectedUser);
                  setIsModalVisible(false);
                }}
                className="!bg-amber-500/10 !text-amber-400 border-none hover:!bg-amber-500/20 flex items-center gap-2 shadow-none"
                style={{ boxShadow: 'none' }}
              >
                Edit
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </ConfigProvider>
  );
}
