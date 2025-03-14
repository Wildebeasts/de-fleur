/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  Table,
  Card,
  Button,
  ConfigProvider,
  theme,
  Tag,
  Space,
  Dropdown,
  Modal,
  message,
  Tooltip,
  Badge
} from 'antd'
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Package,
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  AlertTriangle,
  Truck,
  Home
} from 'lucide-react'
import { DownOutlined } from '@ant-design/icons'
import { BreadcrumbUpdater } from '@/components/BreadcrumbUpdater'
import orderApi from '@/lib/services/orderApi'
import userApi from '@/lib/services/userService'
import cosmeticApi from '@/lib/services/cosmeticApi'
import type { ColumnsType } from 'antd/es/table'

// Animation variants
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

// Helper function to normalize status case
const normalizeStatus = (status: string): string => {
  if (!status) return '';
  return status.toUpperCase();
}

// Format status for display
const formatStatus = (status: string) => {
  return status
    .toUpperCase() // Normalize to uppercase first
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

// Helper function to format currency to VND
const formatToVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

// Status icons mapping
const statusIcons = {
  PENDING_PAYMENT: <Clock className="size-4" />,
  CONFIRMED: <CheckCircle className="size-4" />,
  PROCESSING: <Package className="size-4" />,
  DELIVERY: <Truck className="size-4" />,
  COMPLETED: <Home className="size-4" />,
  REFUNDED: <RefreshCw className="size-4" />,
  CANCELLED: <XCircle className="size-4" />,
  PAYMENT_FAILED: <AlertTriangle className="size-4" />,
  EXPIRED: <AlertTriangle className="size-4" />
}

// Status colors for badges
const getStatusBadgeConfig = (status: string) => {
  const normalizedStatus = normalizeStatus(status);

  switch (normalizedStatus) {
    case 'CONFIRMED':
      return { status: 'success', text: 'Confirmed', icon: statusIcons.CONFIRMED };
    case 'PENDING_PAYMENT':
      return { status: 'warning', text: 'Pending Payment', icon: statusIcons.PENDING_PAYMENT };
    case 'PROCESSING':
      return { status: 'processing', text: 'Processing', icon: statusIcons.PROCESSING };
    case 'DELIVERY':
      return { status: 'blue', text: 'Delivery', icon: statusIcons.DELIVERY };
    case 'COMPLETED':
      return { status: 'success', text: 'Completed', icon: statusIcons.COMPLETED };
    case 'REFUNDED':
      return { status: 'warning', text: 'Refunded', icon: statusIcons.REFUNDED };
    case 'CANCELLED':
      return { status: 'error', text: 'Cancelled', icon: statusIcons.CANCELLED };
    case 'PAYMENT_FAILED':
      return { status: 'error', text: 'Payment Failed', icon: statusIcons.PAYMENT_FAILED };
    case 'EXPIRED':
      return { status: 'error', text: 'Expired', icon: statusIcons.EXPIRED };
    default:
      return { status: 'default', text: formatStatus(status), icon: null };
  }
}

// Format date helper
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid date';
  }
}

interface OrderItem {
  cosmeticId: string;
  quantity: number;
  sellingPrice: number;
  subTotal: number;
}

interface Order {
  id: string;
  orderDate: string;
  status: string;
  totalPrice: number;
  orderItems: OrderItem[];
  trackingNumber: string;
  shippingAddress: string;
  deliveryDate: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  customer?: {
    id: string;
    userName: string;
    email: string;
  };
  customerId?: string;
}

const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [orderItemsDetails, setOrderItemsDetails] = useState<any[]>([]);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch all users once when component mounts
  useEffect(() => {
    const fetchAllUsers = async () => {
      setLoadingUsers(true);
      try {
        // Direct API call to get the raw response
        const response = await userApi.getUsers();
        console.log('Raw user API response:', response);

        // Check if response is directly an array
        if (Array.isArray(response)) {
          setAllUsers(response);
          console.log('Users set in state, count:', response.length);
        }
        // Check if response has data property that is an array
        else if (response && response.data && Array.isArray(response.data)) {
          setAllUsers(response.data);
          console.log('Users set in state, count:', response.data.length);
        }
        // Check if response is an object with isSuccess and data array
        else if (response && response.isSuccess && Array.isArray(response.data)) {
          setAllUsers(response.data);
          console.log('Users set in state, count:', response.data.length);
        }
        else {
          console.error('Unexpected response format:', response);
          setAllUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setAllUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchAllUsers();
  }, []);

  // Fetch orders using the API
  const {
    data: ordersData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['allOrders'],
    queryFn: async () => {
      const response = await orderApi.getAllOrders();
      console.log('API Response:', response.data); // Debug log
      if (response.data.isSuccess) {
        // Transform the data to ensure consistent structure
        return (response.data.data || []).map((order: any) => ({
          ...order,
          orderItems: Array.isArray(order.orderItems) ? order.orderItems : [],
          customer: order.customer || null,
          // Ensure these fields exist
          firstName: order.firstName || '',
          lastName: order.lastName || '',
          email: order.email || (order.customer ? order.customer.email : '')
        }));
      }
      throw new Error(response.data.message || 'Failed to fetch orders');
    }
  });

  // Add this after the useEffect that fetches users
  useEffect(() => {
    if (ordersData && allUsers.length > 0) {
      console.log('Checking user matches:');
      ordersData.forEach(order => {
        const user = allUsers.find(u => u.id === order.customerId);
        console.log(`Order ${order.id.substring(0, 8)}: customerId=${order.customerId}, userFound=${!!user}`);
      });
    }
  }, [ordersData, allUsers]);

  // Function to fetch order details including user and items
  const fetchOrderDetails = async (order: Order) => {
    setLoadingDetails(true);
    setSelectedOrderDetails(order);
    setDetailsModalVisible(true);

    try {
      // Find user from pre-fetched users list by matching customerId with user id
      if (order.customerId) {
        const user = allUsers.find(u => u.id === order.customerId);
        if (user) {
          console.log('Found user for order:', user);
          setUserDetails(user);
        } else {
          console.log(`User with ID ${order.customerId} not found in pre-fetched list`);
          setUserDetails(null);
        }
      } else {
        setUserDetails(null);
      }

      // Fetch details for each order item
      const itemDetailsPromises = order.orderItems.map(async (item) => {
        try {
          const cosmeticResponse = await cosmeticApi.getCosmeticById(item.cosmeticId);
          if (cosmeticResponse.data.isSuccess) {
            return {
              ...item,
              details: cosmeticResponse.data.data
            };
          }
          return item;
        } catch (error) {
          console.error(`Failed to fetch details for item ${item.cosmeticId}`, error);
          return item;
        }
      });

      const itemsWithDetails = await Promise.all(itemDetailsPromises);
      setOrderItemsDetails(itemsWithDetails);
    } catch (error) {
      console.error('Error fetching order details:', error);
      message.error('Failed to load order details');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle view order details
  const handleViewOrder = (order: Order) => {
    fetchOrderDetails(order);
  };

  // Handle edit order status
  const handleEditStatus = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusModalVisible(true);
  };

  // Handle delete order
  const handleDeleteOrder = (order: Order) => {
    setSelectedOrder(order);
    setDeleteModalVisible(true);
  };

  // Confirm delete order
  const confirmDeleteOrder = async () => {
    if (!selectedOrder) return;

    try {
      const response = await orderApi.deleteOrder(selectedOrder.id);
      if (response.data.isSuccess) {
        message.success('Order deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['allOrders'] });
        setDeleteModalVisible(false);
      } else {
        message.error(response.data.message || 'Failed to delete order');
      }
    } catch (error) {
      message.error('An error occurred while deleting the order');
      console.error(error);
    }
  };

  // Confirm status update
  const confirmStatusUpdate = async () => {
    if (!selectedOrder) return;

    try {
      const response = await orderApi.updateOrderStatus(selectedOrder.id, { status: newStatus });
      if (response.data.isSuccess) {
        message.success('Order status updated successfully');
        queryClient.invalidateQueries({ queryKey: ['allOrders'] });
        setStatusModalVisible(false);
      } else {
        message.error(response.data.message || 'Failed to update order status');
      }
    } catch (error) {
      message.error('An error occurred while updating the order status');
      console.error(error);
    }
  };

  // Define table columns
  const columns: ColumnsType<Order> = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <Tooltip title={id}>
          <span className="font-mono text-xs">{id.substring(0, 8)}...</span>
        </Tooltip>
      ),
      width: 100
    },
    {
      title: 'Customer',
      dataIndex: 'customerId',
      key: 'customer',
      render: (customerId: string, record: Order) => {
        // Find user from allUsers by matching customerId with user id
        const user = allUsers.find(u => u.id === customerId);

        // Debug logging to see what's happening
        console.log('Rendering customer:', {
          customerId,
          userFound: !!user,
          userName: user?.userName,
          allUsersLength: allUsers.length
        });

        if (user) {
          return (
            <div>
              <div className="font-medium">
                {`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userName}
              </div>
              <div className="text-xs text-gray-400">
                {user.email || 'No email'}
              </div>
            </div>
          );
        } else {
          return (
            <div>
              <div className="font-medium">
                {record.customer?.userName || 'Guest User'}
              </div>
              <div className="text-xs text-gray-400">
                {record.email || 'No email'}
              </div>
            </div>
          );
        }
      },
      width: 200
    },
    {
      title: 'Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date: string) => formatDate(date),
      sorter: (a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime(),
      width: 180
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = getStatusBadgeConfig(status);
        return (
          <div className="flex items-center gap-2">
            <Badge status={config.status as any} />
            <span>{config.text}</span>
          </div>
        );
      },
      filters: [
        { text: 'Pending Payment', value: 'PENDING_PAYMENT' },
        { text: 'Confirmed', value: 'CONFIRMED' },
        { text: 'Processing', value: 'PROCESSING' },
        { text: 'Delivery', value: 'DELIVERY' },
        { text: 'Completed', value: 'COMPLETED' },
        { text: 'Cancelled', value: 'CANCELLED' },
        { text: 'Refunded', value: 'REFUNDED' },
        { text: 'Payment Failed', value: 'PAYMENT_FAILED' },
        { text: 'Expired', value: 'EXPIRED' }
      ],
      onFilter: (value, record) => normalizeStatus(record.status) === value,
      width: 150
    },
    {
      title: 'Items',
      dataIndex: 'orderItems',
      key: 'items',
      render: (items: OrderItem[]) => (
        <div className="text-center">
          {items && items.length > 0 ? items.length : 0}
        </div>
      ),
      width: 80
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => formatToVND(price),
      sorter: (a, b) => a.totalPrice - b.totalPrice,
      width: 150
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: '1',
                label: 'View Details',
                icon: <Eye size={14} />,
                onClick: () => handleViewOrder(record)
              },
              {
                key: '2',
                label: 'Update Status',
                icon: <Edit size={14} />,
                onClick: () => handleEditStatus(record)
              },
              {
                key: '3',
                label: 'Delete Order',
                icon: <Trash2 size={14} />,
                danger: true,
                onClick: () => handleDeleteOrder(record)
              }
            ]
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreHorizontal size={16} />} />
        </Dropdown>
      ),
      width: 80
    }
  ];

  // Theme configuration to match existing admin pages
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
        colorSplit: '#303030'
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
  };

  // Status options for the dropdown
  const statusOptions = [
    { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'DELIVERY', label: 'Delivery' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'REFUNDED', label: 'Refunded' },
    { value: 'PAYMENT_FAILED', label: 'Payment Failed' },
    { value: 'EXPIRED', label: 'Expired' }
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1117]">
        <Loader2 className="mr-2 size-8 animate-spin text-blue-500" />
        <span className="text-lg text-white">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    toast.error('Failed to load orders');
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d1117]">
        <div className="mb-4 rounded-full bg-red-900/20 p-3">
          <Package className="size-8 text-red-500" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-white">
          Error Loading Orders
        </h2>
        <p className="text-gray-400">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
      </div>
    );
  }

  return (
    <ConfigProvider theme={tableTheme}>
      <BreadcrumbUpdater
        items={['Admin Dashboard', 'Orders', 'All Orders']}
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
              Orders
            </motion.h1>
            <motion.p className="text-gray-400" variants={itemVariants}>
              Manage all customer orders
            </motion.p>
          </div>
        </div>

        <motion.div variants={itemVariants}>
          <Card
            className="rounded-xl border border-gray-100/10 bg-[#1a1b24]"
            title={
              <div className="my-4 flex items-center gap-3">
                <div className="rounded-lg bg-[#282d35] p-2">
                  <Package className="size-5 text-blue-400" />
                </div>
                <span className="text-lg font-semibold text-white">
                  All Orders
                </span>
              </div>
            }
          >
            <Table
              columns={columns}
              dataSource={ordersData}
              rowKey="id"
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                onChange: (page, pageSize) => {
                  setCurrentPage(page);
                  setPageSize(pageSize);
                },
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (total) => `Total ${total} orders`
              }}
              scroll={{ x: 1000, y: 700 }}
              // eslint-disable-next-line tailwindcss/no-custom-classname
              className="custom-dark-table"
            />
          </Card>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <Modal
          title="Confirm Delete"
          open={deleteModalVisible}
          onCancel={() => setDeleteModalVisible(false)}
          onOk={confirmDeleteOrder}
          okText="Delete"
          okButtonProps={{ danger: true }}
          // eslint-disable-next-line tailwindcss/no-custom-classname
          className="custom-dark-modal"
        >
          <p>Are you sure you want to delete this order?</p>
          <p className="mt-2 text-sm text-gray-400">
            Order ID: {selectedOrder?.id}
          </p>
        </Modal>

        {/* Status Update Modal */}
        <Modal
          title="Update Order Status"
          open={statusModalVisible}
          onCancel={() => setStatusModalVisible(false)}
          onOk={confirmStatusUpdate}
          okText="Update"
        >
          <div className="mb-4">
            <p className="mb-2">Order ID: {selectedOrder?.id}</p>
            <p className="mb-4">
              Current Status:{' '}
              <span className="ml-2 inline-flex items-center gap-2">
                <Badge status={getStatusBadgeConfig(selectedOrder?.status || '').status as any} />
                {formatStatus(selectedOrder?.status || '')}
              </span>
            </p>
            <div className="mb-2">New Status:</div>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-[#1f1f1f] p-2 text-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </Modal>

        {/* Add Order Details Modal */}
        <Modal
          title="Order Details"
          open={detailsModalVisible}
          onCancel={() => setDetailsModalVisible(false)}
          footer={null}
          width={800}
        >
          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="mr-2 size-6 animate-spin text-blue-500" />
              <span>Loading order details...</span>
            </div>
          ) : selectedOrderDetails ? (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="rounded-lg bg-gray-800/40 p-4">
                <h3 className="mb-3 text-lg font-medium text-white">Order Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Order ID:</span>
                    <div className="font-mono text-white">{selectedOrderDetails.id}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Date:</span>
                    <div className="text-white">{formatDate(selectedOrderDetails.orderDate)}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge status={getStatusBadgeConfig(selectedOrderDetails.status).status as any} />
                      <span className="text-white">{getStatusBadgeConfig(selectedOrderDetails.status).text}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Total:</span>
                    <div className="text-white">{formatToVND(selectedOrderDetails.totalPrice)}</div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="rounded-lg bg-gray-800/40 p-4">
                <h3 className="mb-3 text-lg font-medium text-white">Customer Information</h3>
                {userDetails ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Name:</span>
                      <div className="text-white">
                        {userDetails.firstName} {userDetails.lastName}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Username:</span>
                      <div className="text-white">{userDetails.userName}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Email:</span>
                      <div className="text-white">{userDetails.email}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Phone:</span>
                      <div className="text-white">{userDetails.phoneNumber || 'N/A'}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    {selectedOrderDetails.customer?.userName || 'Guest User'}
                  </div>
                )}
              </div>

              {/* Shipping Information */}
              <div className="rounded-lg bg-gray-800/40 p-4">
                <h3 className="mb-3 text-lg font-medium text-white">Shipping Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Shipping Address:</span>
                    <div className="text-white">{selectedOrderDetails.shippingAddress || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Tracking Number:</span>
                    <div className="text-white">{selectedOrderDetails.trackingNumber || 'N/A'}</div>
                  </div>
                  {selectedOrderDetails.deliveryDate && (
                    <div>
                      <span className="text-gray-400">Delivery Date:</span>
                      <div className="text-white">{formatDate(selectedOrderDetails.deliveryDate)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="rounded-lg bg-gray-800/40 p-4">
                <h3 className="mb-3 text-lg font-medium text-white">Order Items</h3>
                <div className="space-y-4">
                  {orderItemsDetails && orderItemsDetails.length > 0 ? (
                    orderItemsDetails.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 border-b border-gray-700 pb-4">
                        <div className="size-16 shrink-0 overflow-hidden rounded-md bg-gray-700">
                          {item.details?.images?.[0] ? (
                            <img
                              src={item.details.images[0]}
                              alt={item.details.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center">
                              <Package className="size-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white">
                            {item.details?.name || `Product ID: ${item.cosmeticId.substring(0, 8)}...`}
                          </h4>
                          <div className="mt-1 flex items-center justify-between text-sm">
                            <div className="text-gray-400">
                              Quantity: <span className="text-white">{item.quantity}</span>
                            </div>
                            <div className="text-gray-400">
                              Price: <span className="text-white">{formatToVND(item.sellingPrice)}</span>
                            </div>
                            <div className="text-gray-400">
                              Subtotal: <span className="text-white">{formatToVND(item.subTotal)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400">
                      No items found in this order
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end border-t border-gray-700 pt-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-400">
                      Total Items: <span className="text-white">{selectedOrderDetails.orderItems.length}</span>
                    </div>
                    <div className="mt-1 text-lg font-medium text-white">
                      Total: {formatToVND(selectedOrderDetails.totalPrice)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">No order details available</div>
          )}
        </Modal>
      </motion.div>
    </ConfigProvider>
  );
};

export default OrderList;