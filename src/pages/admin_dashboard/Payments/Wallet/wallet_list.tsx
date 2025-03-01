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
import walletApi, { WalletDto } from "@/utils/services/WalletService";
import userApi, { UserDto } from "@/lib/services/userService";

const WalletList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState<WalletDto | null>(null);
  const [wallets, setWallets] = useState<WalletDto[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });
  const [userDetails, setUserDetails] = useState<Record<string, UserDto>>({});

  const fetchWallets = async () => {
    try {
      setLoading(true);
      // Replace with your actual API call
      const response = await walletApi.getWallets(
        pagination.current - 1,
        pagination.pageSize
      );
      setWallets(response.items);
      setPagination({
        ...pagination,
        total: response.totalPages * pagination.pageSize,
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      message.error("Failed to fetch wallets");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userIds: string[]) => {
    try {
      const details = await Promise.all(
        userIds.map((id) => userApi.getUserById(id))
      );
      const userMap = details.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<string, UserDto>);
      setUserDetails(userMap);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      message.error("Failed to fetch user details");
    }
  };

  useEffect(() => {
    fetchWallets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current]);

  useEffect(() => {
    if (wallets.length > 0) {
      fetchUserDetails(wallets.map((wallet) => wallet.userId));
    }
  }, [wallets]);

  const getStatusConfig = (status: string) => {
    const statusMap = {
      Active: {
        color: "text-emerald-400",
        bgColor: "bg-emerald-400/10",
        text: "ACTIVE",
      },
      Inactive: {
        color: "text-gray-400",
        bgColor: "bg-gray-400/10",
        text: "INACTIVE",
      },
      Suspended: {
        color: "text-rose-400",
        bgColor: "bg-rose-400/10",
        text: "SUSPENDED",
      },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.Inactive;
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await walletApi.updateWalletStatus(userId, newStatus);
      message.success(`Wallet status updated to ${newStatus}`);
      fetchWallets();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      message.error("Failed to update wallet status");
    }
  };

  //@ts-expect-error -- expected
  const getStatusActions = (wallet: WalletDto): MenuProps["items"] => {
    return [
      {
        key: "activate",
        label: (
          <div
            className="px-4 py-2 hover:bg-emerald-500/10 text-emerald-400 transition-colors duration-200 cursor-pointer"
            onClick={() => handleStatusChange(wallet.userId, "Active")}
          >
            Activate
          </div>
        ),
      },
      {
        key: "suspend",
        label: (
          <div
            className="px-4 py-2 hover:bg-rose-500/10 text-rose-400 transition-colors duration-200 cursor-pointer"
            onClick={() => handleStatusChange(wallet.userId, "Suspended")}
          >
            Suspend
          </div>
        ),
      },
    ];
  };

  const getCardGradient = (index: number) => {
    const gradients = [
      "from-blue-500/90 via-blue-600/90 to-blue-700/90",
      "from-purple-500/90 via-purple-600/90 to-purple-700/90",
      "from-emerald-500/90 via-emerald-600/90 to-emerald-700/90",
      "from-orange-500/90 via-red-500/90 to-red-600/90",
    ];
    return gradients[index % gradients.length];
  };

  const formatCardNumber = (userId: string) => {
    // Generate a pseudo-card number using the last 4 chars of userId
    const last4 = userId.slice(-4);
    return `•••• •••• •••• ${last4}`;
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
        items={["Admin Dashboard", "Payments", "Wallets"]}
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
                  Wallet List
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
          ) : wallets.length === 0 ? (
            <Empty description="No wallets found" />
          ) : (
            //@ts-expect-error -- expected
            <Row gutter={[16, 16]}>
              {wallets.map((wallet, index) => (
                //@ts-expect-error -- expected
                <Col xs={24} sm={12} md={8} lg={6} key={wallet.userId}>
                  <Card
                    hoverable
                    className={`relative overflow-hidden bg-gradient-to-br ${getCardGradient(
                      index
                    )} 
                      rounded-2xl border border-white/10 backdrop-blur-sm transition-all duration-300 
                      cursor-pointer h-[220px] group`}
                    onClick={() => setSelectedWallet(wallet)}
                  >
                    {/* Add Card Number */}
                    <div className="absolute top-4 left-4">
                      <div className="text-sm text-white/60 font-medium mb-1">
                        Wallet Number
                      </div>
                      <div className="text-lg text-white font-medium tracking-wider">
                        {formatCardNumber(wallet.userId)}
                      </div>
                    </div>

                    {/* Glass Effect Overlay */}
                    <div
                      className="absolute inset-0 bg-white/5 backdrop-blur-[2px] opacity-0 
                      group-hover:opacity-100 transition-opacity duration-300"
                    />

                    {/* Credit Card Chip */}
                    <div className="absolute top-[5.5rem] right-4">
                      <div className="w-14 h-10 rounded-[4px] bg-gradient-to-br from-[#EBCF7F] to-[#C4A022] relative overflow-hidden">
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-[1px]">
                          {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="bg-black/10" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <div
                        className={`px-4 py-1.5 rounded-full text-xs font-medium 
                        bg-white/10 backdrop-blur-sm border border-white/20
                        ${getStatusConfig(wallet.status).color} shadow-lg`}
                      >
                        {getStatusConfig(wallet.status).text}
                      </div>
                    </div>

                    {/* User ID */}
                    <div className="absolute bottom-[5.5rem] left-4">
                      <div className="text-sm text-white/60 font-medium mb-1">
                        User
                      </div>
                      <div className="text-lg text-white font-medium">
                        {userDetails[wallet.userId]?.username || "..."}
                      </div>
                    </div>

                    {/* Balance */}
                    <div className="absolute bottom-4 left-4">
                      <div className="text-sm text-white/60 font-medium mb-1">
                        Balance
                      </div>
                      <div className="text-2xl font-bold text-white flex items-center gap-1">
                        {wallet.balance.toLocaleString()}
                        <span className="text-xl">đ</span>
                      </div>
                    </div>

                    {/* Actions Button */}
                    <div className="absolute bottom-4 right-4">
                      {/* @ts-expect-error -- expected */}
                      <Dropdown
                        menu={{ items: getStatusActions(wallet) }}
                        trigger={["click"]}
                        placement="bottomRight"
                      >
                        <Button
                          type="text"
                          className="!text-white/70 hover:!text-white backdrop-blur-sm 
                            border border-white/10 rounded-full"
                          //@ts-expect-error -- expected
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

      {/* Wallet Details Modal */}
      {/* @ts-expect-error -- expected */}
      <Modal
        open={selectedWallet !== null}
        onCancel={() => setSelectedWallet(null)}
        footer={null}
        width={600}
        className="dark-modal"
        closeIcon={
          <X className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
        }
      >
        {selectedWallet && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Wallet Details
            </h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400">User</div>
                <div className="text-white">
                  {userDetails[selectedWallet.userId]?.username || "..."}
                  <span className="text-gray-400 text-sm ml-2">
                    ({selectedWallet.userId})
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Balance</div>
                <div className="text-white text-xl">
                  {selectedWallet.balance.toLocaleString()}
                  <span>đ</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Status</div>
                <div
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium
                  ${getStatusConfig(selectedWallet.status).color} ${
                    getStatusConfig(selectedWallet.status).bgColor
                  }`}
                >
                  {getStatusConfig(selectedWallet.status).text}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Created Date</div>
                <div className="text-white">
                  {format(new Date(selectedWallet.createdDate), "PPP")}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Last Updated</div>
                <div className="text-white">
                  {format(new Date(selectedWallet.updatedDate), "PPP")}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </ConfigProvider>
  );
};

export default WalletList;
