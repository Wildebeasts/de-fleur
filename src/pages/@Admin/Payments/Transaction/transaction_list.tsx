/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Table,
  // @ts-expect-error -- expected
  ConfigProvider,
  Badge,
  message,
  Tooltip,
  Input,
  Button,
  Checkbox,
  Dropdown,
  Modal,
  Form,
  Select,
} from "antd";
import { SearchOutlined, CloseOutlined, EllipsisOutlined, DeleteOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import { useLoading } from "@/contexts/LoadingContext";
import { BreadcrumbUpdater } from "@/components/BreadcrumbUpdater";
import { TransactionApi } from "@/utils/services/TransactionService";
import { RevenueDistributionApi } from "@/utils/services/RevenueDistributionService";
import { useNavigate } from 'react-router-dom';
import { TransactionStatus, TransactionType } from "@/utils/constants/transactionConstants";
import walletApi from '@/utils/services/WalletService';
import systemAccountApi from '@/utils/services/SystemService';
import userApi from '@/utils/services/UserService';

interface Transaction {
  transactionId: string;
  walletId: string;
  distributionId: string;
  systemAccountId: string;
  amount: number;
  timeStamp: string;
  type: string;
  status: string;
  createdDate: string;
  updatedDate: string;
}

interface Distribution {
  distributionId: string;
  orderItemId: string;
  instructorId: string;
  originalAmount: number;
  discountedAmount: number;
  instructorShare: number;
  platformShare: number;
  createdDate: string;
  updatedDate: string;
}

interface DataTypeWithDistribution extends Transaction {
  distribution?: Distribution;
}

interface WalletDto {
  userId: string;
  balance: number;
  status: string;
  createdDate: string;
  updatedDate: string;
}

interface SystemAccountDto {
  systemAccountId: string;
  name: string;
  balance: number;
  createdDate: string;
  updatedDate: string;
}

interface WalletWithUser extends WalletDto {
  user?: {
    firstName?: string;
    lastName?: string;
    username: string;
  };
}

interface AccountNames {
  [key: string]: {
    systemAccount?: string;
    wallet?: string;
  };
}

interface SorterResult {
  column?: {
    dataIndex: string;
  };
  order?: 'ascend' | 'descend';
  field?: string;
  columnKey?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

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

const TransactionList = () => {
  const { startLoading, stopLoading } = useLoading();
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<DataTypeWithDistribution[]>([]);
  const [searchText, setSearchText] = useState("");
  const [originalData, setOriginalData] = useState<DataTypeWithDistribution[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  // @ts-expect-error -- expected
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<DataTypeWithDistribution | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  // @ts-expect-error -- expected
  const [form] = Form.useForm();
  const [wallets, setWallets] = useState<WalletWithUser[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [systemAccounts, setSystemAccounts] = useState<SystemAccountDto[]>([]);
  const [selectedDistributionAmount, setSelectedDistributionAmount] = useState<number>(0);
  // @ts-expect-error -- expected
  const [hasSystemAccount, setHasSystemAccount] = useState(false);
  const [accountNamesMap, setAccountNamesMap] = useState<AccountNames>({});
  // @ts-expect-error -- expected
  const [sortedInfo, setSortedInfo] = useState<SorterResult>({});

  const fetchDistributionData = async (transactions: Transaction[]) => {
    const transactionsWithDistribution = await Promise.all(
      transactions.map(async (transaction) => {
        try {
          const distribution = await RevenueDistributionApi.getDistributionById(transaction.distributionId);
          return {
            ...transaction,
            key: transaction.transactionId,
            distribution
          };
        } catch (error) {
          console.error(`Failed to fetch distribution for ${transaction.distributionId}:`, error);
          return {
            ...transaction,
            key: transaction.transactionId
          };
        }
      })
    );
    return transactionsWithDistribution;
  };

  const fetchAccountNames = async (transactions: DataTypeWithDistribution[]) => {
    const newAccountNames: AccountNames = {};
    
    await Promise.all(
      transactions.map(async (transaction) => {
        try {
          const systemAccountData = await systemAccountApi.getAccountById(transaction.systemAccountId);
          
          let walletName = '';
          if (transaction.walletId && transaction.type !== TransactionType.SYSTEM_TRANSFER) {
            const userData = await userApi.getUserById(transaction.walletId);
            walletName = userData.firstName && userData.lastName ? 
              `${userData.firstName} ${userData.lastName}` : 
              userData.username;
          }

          newAccountNames[transaction.transactionId] = {
            systemAccount: systemAccountData.name,
            wallet: walletName
          };
        } catch (error) {
          console.error('Error fetching account names:', error);
        }
      })
    );

    setAccountNamesMap(newAccountNames);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      startLoading();
      const response = await TransactionApi.getPaginatedTransactions();
      const transactionsWithDistribution = await fetchDistributionData(response.items);
      setTableData(transactionsWithDistribution);
      setOriginalData(transactionsWithDistribution);
      await fetchAccountNames(transactionsWithDistribution);
    } catch (error) {
      message.error("Failed to load transactions");
    } finally {
      setLoading(false);
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
            fromTo: (() => {
              const names = accountNamesMap[item.transactionId] || {};
              const isSystemTransfer = item.type === TransactionType.SYSTEM_TRANSFER;
              const from = isSystemTransfer ? 'User/Learner' : (names.systemAccount || '');
              const to = isSystemTransfer ? (names.systemAccount || '') : (names.wallet || '');
              return `${from} → ${to}`.toLowerCase();
            })(),
            amount: formatCurrency(item.amount).toLowerCase(),
            status: item.status.toLowerCase(),
            transactionId: item.transactionId?.toLowerCase() || '',
            distributionId: item.distributionId?.toLowerCase() || '',
            date: format(new Date(item.createdDate), 'MMM dd, yyyy HH:mm').toLowerCase()
          };

          return Object.values(searchableValues).some(value => 
            value.includes(searchValue)
          );
        });

        setTableData(filteredData);
      }, 300);
    },
    [originalData, accountNamesMap]
  );

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleMasterCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedRowKeys(e.target.checked ? tableData.map((item) => item.transactionId) : []);
  };

  const fetchDropdownData = async () => {
    try {
      setLoading(true);
      const [walletsData, distributionsData, systemAccountsData] = await Promise.all([
        walletApi.getWallets(0, 100),
        RevenueDistributionApi.getPaginatedDistributions(0, 100),
        systemAccountApi.getAccounts(0, 100)
      ]);
      
      const walletsWithUsers = await Promise.all(
        walletsData.items.map(async (wallet) => {
          try {
            const user = await userApi.getUserById(wallet.userId);
            return {
              ...wallet,
              user
            };
          } catch (error) {
            console.error(`Failed to fetch user for wallet ${wallet.userId}:`, error);
            return wallet;
          }
        })
      );
      
      setWallets(walletsWithUsers);
      setDistributions(distributionsData.items);
      // @ts-expect-error -- expected
      setSystemAccounts(systemAccountsData.items);
    } catch (error) {
      console.error('Error fetching form data:', error);
      message.error('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const showModal = async (transaction: DataTypeWithDistribution | null = null) => {
    setSelectedTransaction(transaction);
    setIsEditMode(!!transaction);
    setIsModalVisible(true);
    if (!transaction) {
      await fetchDropdownData();
    }
    if (transaction) {
      form.setFieldsValue(transaction);
    } else {
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedTransaction(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = async (values: any) => {
    try {
      if (isEditMode && selectedTransaction) {
        await TransactionApi.updateTransaction({
          transactionId: selectedTransaction.transactionId,
          ...values,
        });
        message.success("Transaction updated successfully");
      } else {
        await TransactionApi.createTransaction(values);
        message.success("Transaction created successfully");
      }
      fetchData();
      handleCancel();
    } catch (error) {
      message.error("Failed to save transaction");
    }
  };

  const handleDelete = async (transactionId: string) => {
    try {
      await TransactionApi.deleteTransaction(transactionId);
      message.success("Transaction deleted successfully");
      fetchData();
    } catch (error) {
      message.error("Failed to delete transaction");
    }
  };

  const handleMassDelete = async () => {
    Modal.confirm({
      title: 'Are you sure you want to delete these transactions?',
      // @ts-expect-error -- expected
      content: `This will delete ${selectedRowKeys.length} transactions.`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await Promise.all(
            selectedRowKeys.map((key) => TransactionApi.deleteTransaction(key.toString()))
          );
          message.success(`${selectedRowKeys.length} transactions deleted successfully`);
          setSelectedRowKeys([]);
          fetchData();
        } catch (error) {
          message.error("Failed to delete transactions");
        }
      },
    });
  };

  const handleDistributionChange = (distributionId: string) => {
    const selectedDist = distributions.find(d => d.distributionId === distributionId);
    if (selectedDist) {
      setSelectedDistributionAmount(selectedDist.originalAmount);
      form.setFieldsValue({ amount: selectedDist.originalAmount });
    }
  };

  const handleSystemAccountChange = (systemAccountId: string | null) => {
    const hasSystem = !!systemAccountId;
    setHasSystemAccount(hasSystem);
    if (hasSystem) {
      form.setFieldsValue({ type: TransactionType.SYSTEM_TRANSFER });
    }
  };

  const handleWalletChange = (walletId: string | null) => {
    const transactionType = walletId ? 
      TransactionType.INSTRUCTOR_PAYOUT : 
      TransactionType.SYSTEM_TRANSFER;
    
    form.setFieldsValue({ type: transactionType });
  };

  const TransactionDetails = ({ transaction }: { transaction: DataTypeWithDistribution }) => {
    const [accountNames, setAccountNames] = useState<{
      systemAccount?: string;
      wallet?: string;
    }>({});

    useEffect(() => {
      const fetchAccountNames = async () => {
        try {
          const systemAccountData = await systemAccountApi.getAccountById(transaction.systemAccountId);
          
          let walletName = '';
          if (transaction.walletId) {
            const userData = await userApi.getUserById(transaction.walletId);
            walletName = userData.firstName && userData.lastName ? 
              `${userData.firstName} ${userData.lastName}` : 
              userData.username;
          }

          setAccountNames({
            systemAccount: systemAccountData.name,
            wallet: walletName
          });
        } catch (error) {
          console.error('Error fetching account names:', error);
        }
      };

      fetchAccountNames();
    }, [transaction]);

    return (
      <div className="space-y-6 p-6 bg-[#1f2329] rounded-lg">
        {/* Transaction Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Transaction Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Transaction ID</p>
              <p className="text-white font-mono">{transaction.transactionId}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Amount</p>
              <p className="text-white font-medium">{formatCurrency(transaction.amount)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Type</p>
              <p className="text-white">{transaction.type}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Status</p>
              <Badge
                // @ts-expect-error -- expected
                color={{
                  [TransactionStatus.PENDING]: '#f59e0b',
                  [TransactionStatus.COMPLETED]: '#10b981',
                  [TransactionStatus.FAILED]: '#ef4444',
                  [TransactionStatus.CANCELLED]: '#6b7280'
                }[transaction.status]}
                text={transaction.status}
              />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Created Date</p>
              <p className="text-white">{format(new Date(transaction.createdDate), 'MMM dd, yyyy HH:mm')}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Last Updated</p>
              <p className="text-white">{format(new Date(transaction.updatedDate), 'MMM dd, yyyy HH:mm')}</p>
            </div>
          </div>
        </div>

        {/* Distribution Details */}
        {transaction.distribution && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Distribution Details</h3>
            <div className="bg-[#2a2f36] p-4 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Distribution ID</p>
                  <p className="text-white font-mono">{transaction.distribution.distributionId}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Original Amount</p>
                  <p className="text-white font-medium">{formatCurrency(transaction.distribution.originalAmount)}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Instructor Share</span>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">
                      {((transaction.distribution.instructorShare / transaction.distribution.originalAmount) * 100).toFixed(1)}%
                    </span>
                    <span className="text-white font-medium">
                      {formatCurrency(transaction.distribution.instructorShare)}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Platform Share</span>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">
                      {((transaction.distribution.platformShare / transaction.distribution.originalAmount) * 100).toFixed(1)}%
                    </span>
                    <span className="text-white font-medium">
                      {formatCurrency(transaction.distribution.platformShare)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Updated Account Information section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Account Information</h3>
          <div className="bg-[#2a2f36] p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">System Account</p>
                <p className="text-white">
                  {accountNames.systemAccount || 'Loading...'}
                  <span className="text-gray-400 text-xs ml-2">
                    ({transaction.systemAccountId.substring(0, 8)}...)
                  </span>
                </p>
              </div>
              {transaction.walletId && (
                <div>
                  <p className="text-gray-400 text-sm">Wallet Owner</p>
                  <p className="text-white">
                    {accountNames.wallet || 'Loading...'}
                    <span className="text-gray-400 text-xs ml-2">
                      ({transaction.walletId.substring(0, 8)}...)
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const columns = useMemo(
    () => [
      {
        title: "Transaction ID",
        dataIndex: "transactionId",
        key: "transactionId",
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
        title: "From → To",
        key: "fromTo",
        width: "30%",
        filters: [
          { text: 'System Transfer', value: TransactionType.SYSTEM_TRANSFER },
          { text: 'Instructor Payout', value: TransactionType.INSTRUCTOR_PAYOUT }
        ],
        onFilter: (value: string, record: DataTypeWithDistribution) => record.type === value,
        render: (_: unknown, record: DataTypeWithDistribution) => {
          const names = accountNamesMap[record.transactionId] || {};
          const isSystemTransfer = record.type === TransactionType.SYSTEM_TRANSFER;
          
          return (
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">
                {isSystemTransfer ? 'User/Learner' : names.systemAccount || 'Loading...'}
              </span>
              <span className="text-gray-400 mx-2">→</span>
              <span className="text-gray-400">
                {isSystemTransfer ? 
                  names.systemAccount || 'Loading...' : 
                  (names.wallet || 'Loading...')}
              </span>
            </div>
          );
        },
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        width: "15%",
        render: (amount: number) => {
          const formattedAmount = formatCurrency(amount);
          return (
            <span>
              <MemoizedHighlightText text={formattedAmount} searchText={searchText} />
            </span>
          );
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: "15%",
        render: (status: string) => {
          const statusColors = {
            [TransactionStatus.PENDING]: '#f59e0b',
            [TransactionStatus.COMPLETED]: '#10b981',
            [TransactionStatus.FAILED]: '#ef4444',
            [TransactionStatus.CANCELLED]: '#6b7280'
          };
          
          return (
            <Badge
              // @ts-expect-error -- expected
              color={statusColors[status as keyof typeof statusColors]}
              text={
                <span style={{ color: statusColors[status as keyof typeof statusColors] }}>
                  {status}
                </span>
              }
            />
          );
        },
      },
      {
        title: "Date",
        dataIndex: "createdDate",
        key: "createdDate",
        width: "15%",
        defaultSortOrder: 'descend',
        sorter: (a: DataTypeWithDistribution, b: DataTypeWithDistribution) => {
          return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
        },
        render: (date: string) => {
          const formattedDate = format(new Date(date), 'MMM dd, yyyy HH:mm');
          return <span className="text-gray-400">{formattedDate}</span>;
        },
      },
      {
        title: "Distribution Details",
        key: "distribution",
        width: "25%",
        render: (_: unknown, record: DataTypeWithDistribution) => {
          if (!record.distribution) return <span className="text-gray-400">-</span>;
          
          const instructorSharePercentage = (record.distribution.instructorShare / record.distribution.originalAmount * 100).toFixed(1);
          const platformSharePercentage = (record.distribution.platformShare / record.distribution.originalAmount * 100).toFixed(1);
          
          const formatCurrency = (amount: number) => new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(amount);
          
          return (
            // @ts-expect-error -- expected
            <Tooltip title={`Original Amount: ${formatCurrency(record.distribution.originalAmount)}`}>
              <div className="flex flex-col gap-2">
                <div className="text-xs">
                  <span className="text-gray-400">Instructor: </span>
                  <span className="text-green-400">{instructorSharePercentage}%</span>
                  <span className="text-gray-400 ml-2">
                    ({formatCurrency(record.distribution.instructorShare)})
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-gray-400">Platform: </span>
                  <span className="text-blue-400">{platformSharePercentage}%</span>
                  <span className="text-gray-400 ml-2">
                    ({formatCurrency(record.distribution.platformShare)})
                  </span>
                </div>
              </div>
            </Tooltip>
          );
        },
      },
      {
        title: "Actions",
        key: "actions",
        width: 80,
        align: "center" as const,
        render: (_: unknown, record: DataTypeWithDistribution) => (
          // @ts-expect-error -- expected
          <Dropdown
            menu={{
              items: [
                {
                  key: "view",
                  label: "View Details",
                  onClick: () => {
                    Modal.info({
                      title: <span className="text-white">Transaction Details</span>,
                      // @ts-expect-error -- expected
                      content: (
                        <ConfigProvider
                          theme={{
                            components: {
                              Modal: {
                                contentBg: '#1f2329',
                                headerBg: '#1f2329',
                                titleColor: '#ffffff',
                                colorText: '#ffffff',
                                colorTextSecondary: '#8b949e',
                              },
                              Button: {
                                colorPrimary: '#3b82f6',
                                primaryColor: '#ffffff',
                              },
                            },
                            token: {
                              colorBgContainer: '#1f2329',
                              colorText: '#ffffff',
                              colorTextSecondary: '#8b949e',
                            },
                          }}
                        >
                          <TransactionDetails transaction={record} />
                        </ConfigProvider>
                      ),
                      width: 700,
                      okText: "Close",
                      icon: null,
                      maskClosable: true,
                      centered: true,
                      className: "dark-modal",
                    });
                  },
                },
                {
                  key: "edit",
                  label: "Edit",
                  onClick: () => showModal(record),
                },
                {
                  key: "delete",
                  label: "Delete",
                  danger: true,
                  onClick: () => {
                    Modal.confirm({
                      title: 'Delete Transaction',
                      // @ts-expect-error -- expected
                      content: 'Are you sure you want to delete this transaction?',
                      okText: 'Yes',
                      okType: 'danger',
                      cancelText: 'No',
                      onOk: () => handleDelete(record.transactionId),
                    });
                  },
                },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountNamesMap, navigate, sortedInfo]
  );

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
            filterDropdownBg: "#1f2329",
            filterDropdownMenuBg: "#1f2329",
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
            colorText: "#ffffff",
            colorTextSecondary: "#8b949e",
            filterDropdownColorBg: "#1f2329",
            filterDropdownHoverBg: "#2c333a",
            controlItemBgHover: "#2c333a",
            controlItemBgActive: "#2c333a",
            controlItemBgActiveHover: "#2c333a",
            filterDropdownActiveHoverBg: "#2c333a",
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
            colorBgContainer: "#1f2329",
            colorBorder: "#30363d",
            colorText: "#ffffff",
            colorTextPlaceholder: "#8b949e",
            colorIcon: "#ffffff",
            colorIconHover: "#3b82f6",
          },
          Button: {
            colorPrimary: "#3b82f6",
            colorPrimaryHover: "#2563eb",
            colorPrimaryActive: "#1d4ed8",
            primaryColor: "#ffffff",
            colorBgContainer: "#1f2329",
            colorBorder: "#30363d",
            colorText: "#8b949e",
            boxShadow: "none",
            boxShadowSecondary: "none",
            colorTextLightSolid: "#ffffff",
            defaultBg: "#1f2329",
            defaultColor: "#ffffff",
            defaultBorderColor: "#30363d",
          },
          Checkbox: {
            colorBgContainer: "#1f2329",
            colorBorder: "#8b949e",
            colorText: "#ffffff",
            colorWhite: "#ffffff",
            colorPrimary: "#3b82f6",
            colorPrimaryHover: "#2563eb",
            colorPrimaryBorder: "#3b82f6",
            lineWidth: 1.5,
            borderRadius: 2,
            controlInteractiveSize: 16,
            controlItemBgHover: "#2c333a",
            controlItemBgActive: "#2c333a",
            controlItemBgActiveHover: "#2c333a",
          },
          Dropdown: {
            colorBgElevated: "#282d35",
            controlItemBgHover: "#363b42",
            colorText: "#8b949e",
          },
          Modal: {
            contentBg: "#282d35",
            headerBg: "#282d35",
            titleColor: "#ffffff",
            colorText: "#8b949e",
            colorIcon: "#8b949e",
            colorIconHover: "#ffffff",
            paddingContentHorizontalLG: 24,
            paddingMD: 24,
          },
          Select: {
            colorBgContainer: "#282d35",
            colorBorder: "#30363d",
            colorText: "#ffffff",
            colorTextPlaceholder: "#8b949e",
            colorIcon: "#ffffff",
            colorIconHover: "#3b82f6",
            optionSelectedBg: "#363b42",
            optionSelectedColor: "#ffffff",
            optionActiveBg: "#363b42",
            selectorBg: "#282d35",
            clearBg: "#282d35",
            colorBgElevated: "#282d35",
          },
        },
        token: {
          colorBgElevated: "#1f2329",
          colorText: "#ffffff",
          colorBgContainer: "#1f2329",
          colorBgTextHover: "#2c333a",
          controlItemBgHover: "#2c333a",
          colorBgTextActive: "#2c333a",
          colorPrimary: "#3b82f6",
          colorPrimaryHover: "#2563eb",
          colorPrimaryActive: "#1d4ed8",
          colorBgMask: "rgba(0, 0, 0, 0.45)",
          controlItemBgActive: "#2c333a",
          colorFillSecondary: "#2c333a",
          controlItemBgActiveHover: "#2c333a",
        },
      }}
    >
      <BreadcrumbUpdater
        items={["Admin Dashboard", "Payments", "Transactions"]}
        previousItems={["Admin Dashboard", "Payments"]}
      />
      
      <div className="w-[70%] mx-auto mt-[8rem]">
        <div className="bg-[#282d35] px-6 py-6 mb-4 rounded-lg flex flex-col md:flex-row items-center gap-4">
          <Checkbox
            checked={selectedRowKeys.length === tableData.length}
            // @ts-expect-error -- expected
            indeterminate={
              selectedRowKeys.length > 0 && selectedRowKeys.length < tableData.length
            }
            onChange={handleMasterCheckboxChange}
          />

          <div className="flex-1 flex gap-4">
            <Input
              // @ts-expect-error -- expected
              prefix={<SearchOutlined className="text-[#8b949e]" />}
              placeholder="Search transactions..."
              className="w-full bg-[#282d35]"
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleGlobalSearch(e.target.value)}
              allowClear={{
                clearIcon: (
                  <CloseOutlined className="text-white hover:text-blue-500" />
                ),
              }}
            />
            {/* @ts-expect-error -- expected */}
            <Button
              type="primary"
              onClick={() => showModal()}
              className="bg-blue-500 hover:bg-blue-600 border-none text-white shadow-none"
            >
              Create Transaction
            </Button>
            {selectedRowKeys.length > 0 && (
              // @ts-expect-error -- expected
              <Button
                danger
                type="primary"
                onClick={handleMassDelete}
                icon={<DeleteOutlined />}
                className="border-none shadow-none"
              >
                Delete Selected
              </Button>
            )}
          </div>
        </div>

        {/* @ts-expect-error -- expected */}
        <Table
          columns={columns}
          dataSource={tableData}
          loading={loading}
          rowSelection={{
            type: "checkbox",
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            columnTitle: "",
            columnWidth: 48,
            hideSelectAll: true,
          }}
          pagination={{
            pageSize: 9,
            showSizeChanger: false,
          }}
          scroll={{ y: 600 }}
          size="middle"
        />

        {/* @ts-expect-error -- expected */}
        <Modal
          title={isEditMode ? "Edit Transaction" : "Create Transaction"}
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          centered
        >
          {/* @ts-expect-error -- expected */}
          <Form 
            form={form} 
            onFinish={handleFormSubmit} 
            layout="vertical"
            className="space-y-4"
          >
            {isEditMode ? (
              // Edit Form
              <>
                {/* @ts-expect-error -- expected */}
                <Form.Item 
                  name="amount" 
                  label="Amount" 
                  rules={[{ required: true, message: 'Please enter the amount' }]}
                >
                  {/* @ts-expect-error -- expected */}
                  <Input type="number" placeholder="Enter amount" />
                </Form.Item>

                {/* @ts-expect-error -- expected */}
                <Form.Item 
                  name="status" 
                  label="Status" 
                  rules={[{ required: true, message: 'Please select the status' }]}
                >
                  {/* @ts-expect-error -- expected */}
                  <Select 
                    placeholder="Select transaction status"
                    className="!bg-[#282d35]"
                    popupClassName="!bg-[#282d35]"
                  >
                    {/* @ts-expect-error -- expected */}
                    <Select.Option value={TransactionStatus.PENDING}>Pending</Select.Option>
                    {/* @ts-expect-error -- expected */}
                    <Select.Option value={TransactionStatus.COMPLETED}>Completed</Select.Option>
                    {/* @ts-expect-error -- expected */}
                    <Select.Option value={TransactionStatus.FAILED}>Failed</Select.Option>
                    {/* @ts-expect-error -- expected */}
                    <Select.Option value={TransactionStatus.CANCELLED}>Cancelled</Select.Option>
                  </Select>
                </Form.Item>
              </>
            ) : (
              // Create Form
              <>
                {/* @ts-expect-error -- expected */}
                <Form.Item 
                  name="walletId" 
                  label="Wallet" 
                  rules={[{ required: false }]}
                >
                  {/* @ts-expect-error -- expected */}
                  <Select
                    placeholder="Select wallet"
                    loading={loading}
                    className="!bg-[#282d35]"
                    popupClassName="!bg-[#282d35]"
                    onChange={handleWalletChange}
                    allowClear
                  >
                    {wallets.map(wallet => (
                      // @ts-expect-error -- expected
                      <Select.Option key={wallet.userId} value={wallet.userId}>
                        <div className="flex justify-between">
                          <span>
                            {wallet.user ? (
                              wallet.user.firstName && wallet.user.lastName ? 
                                `${wallet.user.firstName} ${wallet.user.lastName}` : 
                                wallet.user.username
                            ) : `User ${wallet.userId.substring(0, 8)}...`}
                          </span>
                          <span>Balance: {formatCurrency(wallet.balance)}</span>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* @ts-expect-error -- expected */}
                <Form.Item 
                  name="distributionId" 
                  label="Distribution" 
                  rules={[{ required: true, message: 'Please select a distribution' }]}
                >
                  {/* @ts-expect-error -- expected */}
                  <Select
                    placeholder="Select distribution"
                    loading={loading}
                    className="!bg-[#282d35]"
                    popupClassName="!bg-[#282d35]"
                    onChange={handleDistributionChange}
                    style={{ height: '65px' }}
                  >
                    {distributions.map(dist => (
                      // @ts-expect-error -- expected
                      <Select.Option key={dist.distributionId} value={dist.distributionId}>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span>ID: {dist.distributionId.substring(0, 8)}...</span>
                            <span className="font-medium">{formatCurrency(dist.originalAmount)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Instructor: {formatCurrency(dist.instructorShare)}</span>
                            <span>Platform: {formatCurrency(dist.platformShare)}</span>
                          </div>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* @ts-expect-error -- expected */}
                <Form.Item 
                  name="systemAccountId" 
                  label="System Account" 
                  rules={[{ required: true, message: 'Please select a system account' }]}
                >
                  {/* @ts-expect-error -- expected */}
                  <Select
                    placeholder="Select system account"
                    loading={loading}
                    className="!bg-[#282d35]"
                    popupClassName="!bg-[#282d35]"
                    onChange={handleSystemAccountChange}
                  >
                    {systemAccounts.map(account => (
                      // @ts-expect-error -- expected
                      <Select.Option key={account.systemAccountId} value={account.systemAccountId}>
                        <div className="flex justify-between">
                          <span>{account.name}</span>
                          <span>Balance: {formatCurrency(account.balance)}</span>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* @ts-expect-error -- expected */}
                <Form.Item 
                  name="amount" 
                  label="Amount" 
                  rules={[{ required: true, message: 'Please select a distribution first' }]}
                >
                  {/* @ts-expect-error -- expected */}
                  <Input 
                    disabled
                    value={selectedDistributionAmount}
                    className="!bg-[#282d35]"
                  />
                </Form.Item>

                {/* @ts-expect-error -- expected */}
                <Form.Item 
                  name="type" 
                  label="Type"
                  rules={[{ required: true }]}
                >
                  {/* @ts-expect-error -- expected */}
                  <Select 
                    placeholder="Select transaction type"
                    className="!bg-[#282d35]"
                    popupClassName="!bg-[#282d35]"
                    disabled
                  >
                    {/* @ts-expect-error -- expected */}
                    <Select.Option value={TransactionType.INSTRUCTOR_PAYOUT}>Instructor Payout</Select.Option>
                    {/* @ts-expect-error -- expected */}
                    <Select.Option value={TransactionType.SYSTEM_TRANSFER}>System Transfer</Select.Option>
                  </Select>
                </Form.Item>

                {/* @ts-expect-error -- expected */}
                <Form.Item 
                  name="status" 
                  label="Status" 
                  rules={[{ required: true, message: 'Please select the status' }]}
                >
                  {/* @ts-expect-error -- expected */}
                  <Select 
                    placeholder="Select transaction status"
                    className="!bg-[#282d35]"
                    popupClassName="!bg-[#282d35]"
                  >
                    {/* @ts-expect-error -- expected */}
                    <Select.Option value={TransactionStatus.PENDING}>Pending</Select.Option>
                    {/* @ts-expect-error -- expected */}
                    <Select.Option value={TransactionStatus.COMPLETED}>Completed</Select.Option>
                    {/* @ts-expect-error -- expected */}
                    <Select.Option value={TransactionStatus.FAILED}>Failed</Select.Option>
                    {/* @ts-expect-error -- expected */}
                    <Select.Option value={TransactionStatus.CANCELLED}>Cancelled</Select.Option>
                  </Select>
                </Form.Item>
              </>
            )}

            <div className="flex justify-end gap-2">
              {/* @ts-expect-error -- expected */}
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              {/* @ts-expect-error -- expected */}
              <Button type="primary" htmlType="submit">
                {isEditMode ? "Update" : "Create"}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default TransactionList;
