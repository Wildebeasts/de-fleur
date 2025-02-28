import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Table,
  //@ts-expect-error -- expected
  ConfigProvider,
  Badge,
  message,
  Tooltip,
  Input,
  Button,
  Checkbox,
  Dropdown,
} from "antd";
import { SearchOutlined, CloseOutlined, EllipsisOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import { useLoading } from "@/contexts/LoadingContext";
import { BreadcrumbUpdater } from "@/components/BreadcrumbUpdater";
import { OrderApi } from "@/utils/services/OrderService";
import { Area, AreaChart, ResponsiveContainer, YAxis, Tooltip as RechartsTooltip } from "recharts";
import vnpayLogo from '@/assets/logos/vnpay.jpg';
import momoLogo from '@/assets/logos/momo.png';
import { useNavigate } from 'react-router-dom';

interface TransactionDto {
  paymentId: string;
  orderId: string;
  amount: number;
  paymentStatus: boolean;
  paymentMethod: number;
  courseName?: string;
  createdDate: string;
}

interface DataType extends TransactionDto {
  key: React.Key;
}

interface OrderItem {
  courseName: string;
  price: number;
  versionName: string;
}

interface OrderResponse {
  userId: string;
  orderId: string;
  totalPrice: number;
  numberOfCourse: number;
  orderItems: OrderItem[];
}

interface PaginatedOrderResponse {
  items: OrderResponse[];
  pageIndex: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface DailyStats {
  date: string;
  value: number;
}

const HighlightText = ({
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
          <span key={i} className="bg-yellow-500/30">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

const MemoizedHighlightText = React.memo(HighlightText);

// Memoize the MiniChart component
const MiniChart = React.memo(({ data, color }: { data: DailyStats[], color: string }) => {
  if (!data || data.length === 0) return null;

  // Convert color class names to actual hex colors
  const getHexColor = (colorClass: string) => {
    const colorMap = {
      'green-500': '#10b981',
      'blue-500': '#3b82f6',
      'red-500': '#ef4444'
    };
    return colorMap[colorClass as keyof typeof colorMap] || colorClass;
  };

  const hexColor = getHexColor(color);
  const gradientId = `gradient-${hexColor.replace('#', '')}`;

  return (
    <div className="h-12 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={hexColor} stopOpacity={0.2} />
              <stop offset="100%" stopColor={hexColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={['auto', 'auto']} />
          <RechartsTooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#1a1d24] border border-white/10 rounded-lg p-2 text-xs">
                    <p className="text-gray-400">{payload[0]?.payload?.date}</p>
                    <p className="text-gray-300">{typeof payload[0]?.value === 'number' ? payload[0].value.toFixed(1) : payload[0]?.value}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={hexColor}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

MiniChart.displayName = 'MiniChart';

// Create a memoized analytics card component
const AnalyticsCard = React.memo(({ 
  title, 
  value, 
  data, 
  color, 
  icon 
}: { 
  title: string;
  value: string | number;
  data: DailyStats[];
  color: string;
  icon: string;
}) => {
  return (
    <div className="group relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-lg border border-white/[0.08] rounded-xl p-3 hover:border-opacity-20 transition-all duration-300">
      <div className="flex items-center gap-2 mb-1 text-gray-400/90">
        <span className={`text-${color}`}>{icon}</span>
        <span className="text-xs font-medium">{title}</span>
      </div>
      <div className={`text-${color} text-2xl font-semibold tracking-tight`}>
        {value}
      </div>
      <MiniChart data={data} color={color} />
    </div>
  );
});

AnalyticsCard.displayName = 'AnalyticsCard';

const TransactionList = () => {
  const { startLoading, stopLoading } = useLoading();
  const [loading, setLoading] = useState(false);
  // @ts-expect-error -- expected
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = useState<DataType[]>([]);
  const [searchText, setSearchText] = useState("");
  const [originalData, setOriginalData] = useState<DataType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  // @ts-expect-error -- expected
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadingRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [tableData, setTableData] = useState<DataType[]>([]);
  const [analyticsData, setAnalyticsData] = useState({
    successRate: { current: 0, daily: [] as DailyStats[] },
    totalVolume: { current: 0, daily: [] as DailyStats[] },
    failureRate: { current: 0, daily: [] as DailyStats[] }
  });
  const navigate = useNavigate();

  // Define columns first
  const columns = useMemo(
    () => [
      {
        title: "Course",
        dataIndex: "courseName",
        key: "courseName",
        width: "20%",
        render: (text: string) => (
          // @ts-expect-error -- expected
          <Tooltip title={text}>
            <div className="truncate font-medium">
              <MemoizedHighlightText text={text || ''} searchText={searchText} />
            </div>
          </Tooltip>
        ),
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        width: "15%",
        render: (amount: number) => {
          const formattedAmount = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(amount);
          return (
            <span>
              <MemoizedHighlightText text={formattedAmount} searchText={searchText} />
            </span>
          );
        },
      },
      {
        title: "Payment Status",
        dataIndex: "paymentStatus",
        key: "paymentStatus",
        width: "15%",
        render: (status: boolean) => {
          const statusText = status ? "Successful" : "Failed";
          const statusConfig = {
            Successful: { status: 'success', color: '#10b981' },
            Failed: { status: 'error', color: '#ef4444' }
          };
          
          return (
            <Badge
              // @ts-expect-error -- expected
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              status={statusConfig[statusText as keyof typeof statusConfig].status as any}
              text={
                <span style={{ color: statusConfig[statusText as keyof typeof statusConfig].color }}>
                  <MemoizedHighlightText text={statusText} searchText={searchText} />
                </span>
              }
            />
          );
        },
      },
      {
        title: "Payment Method",
        dataIndex: "paymentMethod",
        key: "paymentMethod",
        width: "15%",
        render: (method: number) => {
          const methodMap = {
            0: { name: "VNPay", logo: vnpayLogo },
            1: { name: "MOMO", logo: momoLogo }
          };
          const methodInfo = methodMap[method as keyof typeof methodMap] || { name: "Unknown", logo: null };
          
          return (
            <div className="flex items-center gap-2">
              {methodInfo.logo && (
                <img 
                  src={methodInfo.logo} 
                  alt={methodInfo.name} 
                  className="w-5 h-5 object-contain"
                />
              )}
              <MemoizedHighlightText text={methodInfo.name} searchText={searchText} />
            </div>
          );
        },
      },
      {
        title: "Invoice ID",
        dataIndex: "paymentId",
        key: "paymentId",
        width: "15%",
        render: (id: string) => (
          // @ts-expect-error -- expected
          <Tooltip title={id}>
            <div className="font-mono text-sm truncate">
              <MemoizedHighlightText text={id} searchText={searchText} />
            </div>
          </Tooltip>
        ),
      },
      {
        title: "Order ID",
        dataIndex: "orderId",
        key: "orderId",
        width: "15%",
        render: (id: string) => (
          // @ts-expect-error -- expected
          <Tooltip title={id}>
            <div className="font-mono text-sm truncate">
              <MemoizedHighlightText text={id} searchText={searchText} />
            </div>
          </Tooltip>
        ),
      },
      {
        title: "Date",
        dataIndex: "createdDate",
        key: "createdDate",
        width: "15%",
        sorter: (a: DataType, b: DataType) => {
          const dateA = safeParseDateString(a.createdDate);
          const dateB = safeParseDateString(b.createdDate);
          return dateA.getTime() - dateB.getTime();
        },
        render: (date: string) => {
          const parsedDate = safeParseDateString(date);
          const formattedDate = format(parsedDate, 'MMM dd, yyyy HH:mm');
          return (
            <span className="text-gray-400 hover:text-gray-200 transition-colors duration-200">
              <MemoizedHighlightText text={formattedDate} searchText={searchText} />
            </span>
          );
        },
      },
      {
        title: "Actions",
        key: "actions",
        width: 80,
        align: "center" as const,
        render: (_: unknown, record: DataType) => (
          // @ts-expect-error -- expected
          <Dropdown
            menu={{
              items: [
                {
                  key: "view",
                  label: "View Invoice",
                  onClick: () => navigate(`/admin/payments/invoices/${record.paymentId}`),
                }
              ],
            }}
            trigger={["click"]}
          >
            <Button
              type="text"
              // @ts-expect-error -- expected
              icon={<EllipsisOutlined />}
              className="text-gray-400 hover:text-blue-400"
            />
          </Dropdown>
        ),
      },
    ],
    [searchText, navigate]
  );

  // Then define tableConfig
  const tableConfig = useMemo(
    () => ({
      columns,
      dataSource: tableData,
      loading,
      rowSelection: {
        type: "checkbox" as const,
        selectedRowKeys,
        onChange: setSelectedRowKeys,
        columnTitle: "",
        columnWidth: 48,
        hideSelectAll: true,
      },
      pagination: {
        pageSize: 10,
        showSizeChanger: false,
      },
      scroll: { y: 600 },
      size: "middle" as const,
    }),
    [columns, tableData, loading, selectedRowKeys]
  );

  // Add search handler
  const handleGlobalSearch = useCallback(
    (value: string) => {
      setSearchText(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        const searchValue = value.toLowerCase().trim();
        
        if (!searchValue) {
          setTableData(originalData);
          return;
        }

        const filteredData = originalData.filter((item) => {
          const searchableValues = {
            courseName: item.courseName?.toLowerCase() || '',
            amount: new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(item.amount).toLowerCase(),
            status: item.paymentStatus ? "successful" : "failed",
            method: (() => {
              const methodMap = {
                1: "Credit Card",
                2: "PayPal",
                3: "Bank Transfer",
              };
              return (methodMap[item.paymentMethod as keyof typeof methodMap] || "Unknown").toLowerCase();
            })(),
            paymentId: item.paymentId?.toLowerCase() || '',
            orderId: item.orderId?.toLowerCase() || '',
            date: format(safeParseDateString(item.createdDate), 'MMM dd, yyyy HH:mm').toLowerCase()
          };

          return Object.values(searchableValues).some(value => 
            value.includes(searchValue)
          );
        });

        setTableData(filteredData);
      }, 300);
    },
    [originalData]
  );

  // Add cleanup effect
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const computeAnalytics = (data: DataType[]) => {
    if (!data.length) return {
      successRate: { current: 0, daily: [] as DailyStats[] },
      totalVolume: { current: 0, daily: [] as DailyStats[] },
      failureRate: { current: 0, daily: [] as DailyStats[] }
    };

    // Get last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return format(date, 'MMM dd');
    });

    // Process the data
    const dailyData = last7Days.map(date => {
      const dayTransactions = data.filter(tx => 
        format(safeParseDateString(tx.createdDate), 'MMM dd') === date
      );
      
      const successCount = dayTransactions.filter(tx => tx.paymentStatus).length;
      const totalCount = dayTransactions.length;
      const totalAmount = dayTransactions.reduce((sum, tx) => sum + tx.amount, 0);

      return {
        date,
        successCount,
        totalCount,
        totalAmount
      };
    });

    // Calculate current totals
    const totalTransactions = data.length;
    const successfulTransactions = data.filter(tx => tx.paymentStatus).length;
    const totalAmount = data.reduce((sum, tx) => sum + tx.amount, 0);

    return {
      successRate: {
        current: totalTransactions ? Math.round((successfulTransactions / totalTransactions) * 100) : 0,
        daily: dailyData.map(day => ({
          date: day.date,
          value: day.totalCount ? (day.successCount / day.totalCount) * 100 : 0
        }))
      },
      totalVolume: {
        current: totalAmount,
        daily: dailyData.map(day => ({
          date: day.date,
          value: day.totalAmount
        }))
      },
      failureRate: {
        current: totalTransactions ? Math.round(((totalTransactions - successfulTransactions) / totalTransactions) * 100) : 0,
        daily: dailyData.map(day => ({
          date: day.date,
          value: day.totalCount ? ((day.totalCount - day.successCount) / day.totalCount) * 100 : 0
        }))
      }
    };
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      startLoading();
      
      const response = await OrderApi.getAllOrders();
      const orderResponse = response as PaginatedOrderResponse;
      
      const transactionsWithDetails = await Promise.all(
        orderResponse.items.map(async (order) => {
          try {
            const transaction = await OrderApi.getOrderTransaction(order.orderId);
            return {
              ...transaction,
              key: transaction.paymentId,
              courseName: order.orderItems[0]?.courseName || 'N/A',
              amount: order.totalPrice
            };
          } catch (error) {
            console.error(`Error fetching transaction for order ${order.orderId}:`, error);
            return {
              paymentId: 'N/A',
              orderId: order.orderId,
              amount: order.totalPrice,
              paymentStatus: false,
              paymentMethod: 0,
              courseName: order.orderItems[0]?.courseName || 'N/A',
              key: order.orderId
            };
          }
        })
      );

      setOriginalData(transactionsWithDetails);
      setTableData(transactionsWithDetails);
      setAnalyticsData(computeAnalytics(transactionsWithDetails));
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to fetch transaction data");
    } finally {
      setLoading(false);
      stopLoading();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startLoading, stopLoading]);

  const handleMasterCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedRowKeys(e.target.checked ? tableData.map((item) => item.key) : []);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update function
  const updateData = useCallback(async () => {
    try {
      await fetchData();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to update data:', error);
    }
  }, [fetchData]);

  // Set up update interval (every minute)
  useEffect(() => {
    const intervalId = setInterval(updateData, 60000);
    return () => clearInterval(intervalId);
  }, [updateData]);

  // Format currency
  const formatCurrency = (amount: number) => {
    const millions = (amount / 1000000).toFixed(1);
    return `${millions}M`;
  };

  // Add this to your analytics display if you want to show last update time
  const formatLastUpdate = () => {
    return format(lastUpdate, 'MMM dd, yyyy HH:mm');
  };

  // Memoize the analytics section
  const analyticsSection = useMemo(() => (
    <div>
      <div className="grid grid-cols-3 gap-4">
        <AnalyticsCard
          title="Success Rate"
          value={`${analyticsData.successRate.current}%`}
          data={analyticsData.successRate.daily}
          color="green-500"
          icon="↑"
        />
        <AnalyticsCard
          title="Total Volume"
          value={formatCurrency(analyticsData.totalVolume.current)}
          data={analyticsData.totalVolume.daily}
          color="blue-500"
          icon="₫"
        />
        <AnalyticsCard
          title="Failed"
          value={`${analyticsData.failureRate.current}%`}
          data={analyticsData.failureRate.daily}
          color="red-500"
          icon="!"
        />
      </div>
    </div>
  ), [analyticsData]); // Removed navigate from dependencies

  // Add a helper function to safely parse dates
  const safeParseDateString = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  return (
    <ConfigProvider
      theme={{
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
        },
        token: {
          colorBgContainer: "#282d35",
          colorText: "#ffffff",
          borderRadius: 8,
          padding: 24,
          colorTextDisabled: "#ffffff",
        },
      }}
    >
      <BreadcrumbUpdater
        items={["Admin Dashboard", "Payments", "Invoices"]}
        previousItems={["Admin Dashboard", "Payments"]}
      />
      
      <div className="w-[70%] mx-auto mt-[8rem]">
        {/* Main Analytics Section - Reduced vertical spacing */}
        <div className="flex gap-4 mb-4"> {/* Reduced gap and margin-bottom */}
          {/* Main Analytics Panel - Now full width */}
          <div className="flex-1 bg-gradient-to-br from-[#0d0f14]/60 to-[#151719]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
            <div className="p-3 flex items-center justify-between border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/80 shadow-lg shadow-blue-500/20"></div>
                <h3 className="text-gray-200/90 text-sm font-medium">Payment Analytics Overview</h3>
              </div>
              <div className="text-xs text-gray-400/60">
                Updated: {formatLastUpdate()}
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4">
              {analyticsSection}
            </div>
          </div>
        </div>

        {/* Updated Search Bar with Checkbox */}
        <div className="bg-[#282d35] px-6 py-6 mb-4 rounded-lg flex flex-col md:flex-row items-center gap-4">
          <Checkbox
            checked={selectedRowKeys.length === tableData.length}
            // @ts-expect-error -- expected
            indeterminate={
              selectedRowKeys.length > 0 && selectedRowKeys.length < tableData.length
            }
            onChange={handleMasterCheckboxChange}
          />

          <div className="flex-1">
            <Input
              // @ts-expect-error -- expected
              prefix={<SearchOutlined className="text-[#8b949e]" />}
              placeholder="Search invoices..."
              className="w-full bg-[#282d35]"
              value={searchText}
              // @ts-expect-error -- expected
              onChange={(e) => handleGlobalSearch(e.target.value)}
              allowClear={{
                clearIcon: (
                  <CloseOutlined className="text-white hover:text-blue-500" />
                ),
              }}
            />
          </div>
        </div>

        {/* Updated Table */}
        {/* @ts-expect-error -- expected */}
        <Table {...tableConfig} />
      </div>
    </ConfigProvider>
  );
};

export default TransactionList;


