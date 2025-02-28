import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Button,
  Dropdown,
  Modal,
  message,
  Spin,
  //@ts-expect-error -- expected
  Card,
  //@ts-expect-error -- expected
  Empty,
  //@ts-expect-error -- expected
  ConfigProvider,
  //@ts-expect-error -- expected
  theme,
} from "antd";
import {
  Wallet,
  MoreHorizontal,
  X,
} from "lucide-react";
import type { MenuProps } from "antd";
import { BreadcrumbUpdater } from "@/components/BreadcrumbUpdater";
import { format } from "date-fns";
import systemAccountApi, { SystemAccountDto } from "@/utils/services/SystemService";

const SystemAccountList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<SystemAccountDto | null>(null);
  const [accounts, setAccounts] = useState<SystemAccountDto[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await systemAccountApi.getAccounts(
        pagination.current - 1,
        pagination.pageSize
      );
      setAccounts(response.items);
      setPagination({
        ...pagination,
        total: response.totalPages * pagination.pageSize,
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      message.error("Failed to fetch system accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current]);

  const getCardGradient = (index: number) => {
    const gradients = [
      "from-blue-500/90 via-blue-600/90 to-blue-700/90",
      "from-purple-500/90 via-purple-600/90 to-purple-700/90",
      "from-emerald-500/90 via-emerald-600/90 to-emerald-700/90",
      "from-orange-500/90 via-red-500/90 to-red-600/90",
    ];
    return gradients[index % gradients.length];
  };

  const formatAccountNumber = (accountId: string) => {
    const last4 = accountId.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  const handleDelete = async (accountId: string) => {
    try {
      await systemAccountApi.deleteAccount(accountId);
      message.success("Account deleted successfully");
      fetchAccounts();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      message.error("Failed to delete account");
    }
  };

  // @ts-expect-error -- expected
  const getActions = (account: SystemAccountDto): MenuProps["items"] => {
    return [
      {
        key: "delete",
        label: (
          <div
            className="px-4 py-2 hover:bg-rose-500/10 text-rose-400 transition-colors duration-200 cursor-pointer"
            onClick={() => handleDelete(account.systemAccountId)}
          >
            Delete
          </div>
        ),
      },
    ];
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'PPP');
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Invalid date';
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgBase: "#0d1117",
          colorText: "#ffffff",
        },
      }}
    >
      <BreadcrumbUpdater
        items={["Admin Dashboard", "Payments", "System Accounts"]}
        previousItems={["Admin Dashboard", "Payments"]}
      />

      <div className="w-[80%] mx-auto mt-[8rem]">
        <Card
          title={
            <div className="flex items-center justify-between my-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#282d35]">
                  <Wallet className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-lg font-semibold text-white">
                  System Accounts
                </span>
              </div>
            </div>
          }
          className="bg-[#1a1b24] rounded-xl border border-gray-100/10"
        >
          {loading ? (
            <div className="text-center p-12">
              <Spin size="large" />
            </div>
          ) : accounts.length === 0 ? (
            <Empty description="No system accounts found" />
          ) : (
            // @ts-expect-error -- expected
            <Row gutter={[16, 16]}>
              {accounts.map((account, index) => (
                // @ts-expect-error -- expected
                <Col xs={24} sm={12} md={8} lg={6} key={account.systemAccountId}>
                  <Card
                    hoverable
                    className={`relative overflow-hidden bg-gradient-to-br ${getCardGradient(index)} 
                      rounded-2xl border border-white/10 backdrop-blur-sm transition-all duration-300 
                      cursor-pointer h-[220px] group`}
                    onClick={() => setSelectedAccount(account)}
                  >
                    {/* Account Number */}
                    <div className="absolute top-4 left-4">
                      <div className="text-sm text-white/60 font-medium mb-1">
                        Account Number
                      </div>
                      <div className="text-lg text-white font-medium tracking-wider">
                        {formatAccountNumber(account.systemAccountId)}
                      </div>
                    </div>

                    {/* Glass Effect Overlay */}
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] opacity-0 
                      group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Credit Card Chip */}
                    <div className="absolute top-[5.5rem] right-4">
                      <div className="w-14 h-10 rounded-[4px] bg-gradient-to-br from-[#EBCF7F] to-[#C4A022] relative overflow-hidden">
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-[1px]">
                          {Array(9).fill(null).map((_, i) => (
                            <div key={i} className="bg-black/10" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Account Name */}
                    <div className="absolute bottom-[5.5rem] left-4">
                      <div className="text-sm text-white/60 font-medium mb-1">
                        Account Name
                      </div>
                      <div className="text-lg text-white font-medium">
                        {account.name}
                      </div>
                    </div>

                    {/* Balance */}
                    <div className="absolute bottom-4 left-4">
                      <div className="text-sm text-white/60 font-medium mb-1">
                        Balance
                      </div>
                      <div className="text-2xl font-bold text-white flex items-center gap-1">
                        {account.balance.toLocaleString()}
                        <span className="text-xl">đ</span>
                      </div>
                    </div>

                    {/* Actions Button */}
                    <div className="absolute bottom-4 right-4">
                      {/* @ts-expect-error -- expected */}
                      <Dropdown
                        menu={{ items: getActions(account) }}
                        trigger={["click"]}
                        placement="bottomRight"
                      >
                        <Button
                          type="text"
                          className="!text-white/70 hover:!text-white backdrop-blur-sm 
                            border border-white/10 rounded-full"
                          // @ts-expect-error -- expected
                          icon={<MoreHorizontal className="w-4 h-4" />}
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        />
                      </Dropdown>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card>
      </div>

      {/* Account Details Modal */}
      {/* @ts-expect-error -- expected */}
      <Modal
        open={selectedAccount !== null}
        onCancel={() => setSelectedAccount(null)}
        footer={null}
        width={600}
        className="dark-modal"
        closeIcon={
          <X className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
        }
      >
        {selectedAccount && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Account Details
            </h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400">Account Name</div>
                <div className="text-white">
                  {selectedAccount.name}
                  <span className="text-gray-400 text-sm ml-2">
                    ({selectedAccount.systemAccountId})
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Balance</div>
                <div className="text-white text-xl">
                  {selectedAccount.balance.toLocaleString()}
                  <span>đ</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Created Date</div>
                <div className="text-white">
                  {/* @ts-expect-error -- expected */}
                  {formatDate(selectedAccount.createdDate)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Last Updated</div>
                <div className="text-white">
                  {/* @ts-expect-error -- expected */}
                  {formatDate(selectedAccount.updatedDate)}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </ConfigProvider>
  );
};

export default SystemAccountList;
