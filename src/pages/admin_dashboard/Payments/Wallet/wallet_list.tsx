// /* eslint-disable prettier/prettier */
// import React, { useState, useEffect } from 'react'
// import {
//   Row,
//   Col,
//   Button,
//   Dropdown,
//   Modal,
//   message,
//   Spin,
//   Card,
//   Empty,
//   ConfigProvider,
//   theme
// } from 'antd'
// import { Wallet, MoreHorizontal, X } from 'lucide-react'
// import type { MenuProps } from 'antd'
// import { BreadcrumbUpdater } from '@/components/BreadcrumbUpdater'
// import { format } from 'date-fns'
// import walletApi, { WalletDto } from '@/utils/services/WalletService'
// import userApi, { UserDto } from '@/lib/services/userService'

// const WalletList: React.FC = () => {
//   const [loading, setLoading] = useState(true)
//   const [selectedWallet, setSelectedWallet] = useState<WalletDto | null>(null)
//   const [wallets, setWallets] = useState<WalletDto[]>([])
//   const [pagination, setPagination] = useState({
//     current: 1,
//     pageSize: 12,
//     total: 0
//   })
//   const [userDetails, setUserDetails] = useState<Record<string, UserDto>>({})

//   const fetchWallets = async () => {
//     try {
//       setLoading(true)
//       // Replace with your actual API call
//       const response = await walletApi.getWallets(
//         pagination.current - 1,
//         pagination.pageSize
//       )
//       setWallets(response.items)
//       setPagination({
//         ...pagination,
//         total: response.totalPages * pagination.pageSize
//       })
//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     } catch (error) {
//       message.error('Failed to fetch wallets')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchUserDetails = async (userIds: string[]) => {
//     try {
//       const details = await Promise.all(
//         userIds.map((id) => userApi.getUserById(id))
//       )
//       const userMap = details.reduce(
//         (acc, user) => {
//           acc[user.id] = user
//           return acc
//         },
//         {} as Record<string, UserDto>
//       )
//       setUserDetails(userMap)
//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     } catch (error) {
//       message.error('Failed to fetch user details')
//     }
//   }

//   useEffect(() => {
//     fetchWallets()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pagination.current])

//   useEffect(() => {
//     if (wallets.length > 0) {
//       fetchUserDetails(wallets.map((wallet) => wallet.userId))
//     }
//   }, [wallets])

//   const getStatusConfig = (status: string) => {
//     const statusMap = {
//       Active: {
//         color: 'text-emerald-400',
//         bgColor: 'bg-emerald-400/10',
//         text: 'ACTIVE'
//       },
//       Inactive: {
//         color: 'text-gray-400',
//         bgColor: 'bg-gray-400/10',
//         text: 'INACTIVE'
//       },
//       Suspended: {
//         color: 'text-rose-400',
//         bgColor: 'bg-rose-400/10',
//         text: 'SUSPENDED'
//       }
//     }
//     return statusMap[status as keyof typeof statusMap] || statusMap.Inactive
//   }

//   const handleStatusChange = async (userId: string, newStatus: string) => {
//     try {
//       await walletApi.updateWalletStatus(userId, newStatus)
//       message.success(`Wallet status updated to ${newStatus}`)
//       fetchWallets()
//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     } catch (error) {
//       message.error('Failed to update wallet status')
//     }
//   }

//   const getStatusActions = (wallet: WalletDto): MenuProps['items'] => {
//     return [
//       {
//         key: 'activate',
//         label: (
//           <div
//             className="cursor-pointer px-4 py-2 text-emerald-400 transition-colors duration-200 hover:bg-emerald-500/10"
//             onClick={() => handleStatusChange(wallet.userId, 'Active')}
//           >
//             Activate
//           </div>
//         )
//       },
//       {
//         key: 'suspend',
//         label: (
//           <div
//             className="cursor-pointer px-4 py-2 text-rose-400 transition-colors duration-200 hover:bg-rose-500/10"
//             onClick={() => handleStatusChange(wallet.userId, 'Suspended')}
//           >
//             Suspend
//           </div>
//         )
//       }
//     ]
//   }

//   const getCardGradient = (index: number) => {
//     const gradients = [
//       'from-blue-500/90 via-blue-600/90 to-blue-700/90',
//       'from-purple-500/90 via-purple-600/90 to-purple-700/90',
//       'from-emerald-500/90 via-emerald-600/90 to-emerald-700/90',
//       'from-orange-500/90 via-red-500/90 to-red-600/90'
//     ]
//     return gradients[index % gradients.length]
//   }

//   const formatCardNumber = (userId: string) => {
//     // Generate a pseudo-card number using the last 4 chars of userId
//     const last4 = userId.slice(-4)
//     return `•••• •••• •••• ${last4}`
//   }

//   return (
//     <ConfigProvider
//       theme={{
//         algorithm: theme.darkAlgorithm,
//         token: {
//           colorBgBase: '#0d1117',
//           colorText: '#ffffff'
//         }
//       }}
//     >
//       <BreadcrumbUpdater
//         items={['Admin Dashboard', 'Payments', 'Wallets']}
//         previousItems={['Admin Dashboard', 'Payments']}
//       />

//       <div className="mx-auto mt-32 w-4/5">
//         <Card
//           title={
//             <div className="my-4 flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="rounded-lg bg-[#282d35] p-2">
//                   <Wallet className="size-5 text-blue-400" />
//                 </div>
//                 <span className="text-lg font-semibold text-white">
//                   Wallet List
//                 </span>
//               </div>
//             </div>
//           }
//           className="rounded-xl border border-gray-100/10 bg-[#1a1b24]"
//         >
//           {loading ? (
//             <div className="p-12 text-center">
//               <Spin size="large" />
//             </div>
//           ) : wallets.length === 0 ? (
//             <Empty description="No wallets found" />
//           ) : (
//             <Row gutter={[16, 16]}>
//               {wallets.map((wallet, index) => (
//                 <Col xs={24} sm={12} md={8} lg={6} key={wallet.userId}>
//                   <Card
//                     hoverable
//                     className={`relative overflow-hidden bg-gradient-to-br ${getCardGradient(
//                       index
//                     )}
//                       group h-[220px] cursor-pointer rounded-2xl border border-white/10
//                       backdrop-blur-sm transition-all duration-300`}
//                     onClick={() => setSelectedWallet(wallet)}
//                   >
//                     {/* Add Card Number */}
//                     <div className="absolute left-4 top-4">
//                       <div className="mb-1 text-sm font-medium text-white/60">
//                         Wallet Number
//                       </div>
//                       <div className="text-lg font-medium tracking-wider text-white">
//                         {formatCardNumber(wallet.userId)}
//                       </div>
//                     </div>

//                     {/* Glass Effect Overlay */}
//                     <div
//                       className="absolute inset-0 bg-white/5 opacity-0 backdrop-blur-[2px]
//                       transition-opacity duration-300 group-hover:opacity-100"
//                     />

//                     {/* Credit Card Chip */}
//                     <div className="absolute right-4 top-[5.5rem]">
//                       <div className="relative h-10 w-14 overflow-hidden rounded-[4px] bg-gradient-to-br from-[#EBCF7F] to-[#C4A022]">
//                         <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px">
//                           {Array.from({ length: 9 }).map((_, i) => (
//                             <div key={i} className="bg-black/10" />
//                           ))}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Status Badge */}
//                     <div className="absolute right-4 top-4">
//                       <div
//                         className={`rounded-full border border-white/20 bg-white/10 px-4
//                         py-1.5 text-xs font-medium backdrop-blur-sm
//                         ${getStatusConfig(wallet.status).color} shadow-lg`}
//                       >
//                         {getStatusConfig(wallet.status).text}
//                       </div>
//                     </div>

//                     {/* User ID */}
//                     <div className="absolute bottom-[5.5rem] left-4">
//                       <div className="mb-1 text-sm font-medium text-white/60">
//                         User
//                       </div>
//                       <div className="text-lg font-medium text-white">
//                         {userDetails[wallet.userId]?.username || '...'}
//                       </div>
//                     </div>

//                     {/* Balance */}
//                     <div className="absolute bottom-4 left-4">
//                       <div className="mb-1 text-sm font-medium text-white/60">
//                         Balance
//                       </div>
//                       <div className="flex items-center gap-1 text-2xl font-bold text-white">
//                         {wallet.balance.toLocaleString()}
//                         <span className="text-xl">đ</span>
//                       </div>
//                     </div>

//                     {/* Actions Button */}
//                     <div className="absolute bottom-4 right-4">

//                       <Dropdown
//                         menu={{ items: getStatusActions(wallet) }}
//                         trigger={['click']}
//                         placement="bottomRight"
//                       >
//                         <Button
//                           type="text"
//                           className="rounded-full border border-white/10
//                             !text-white/70 backdrop-blur-sm hover:!text-white"
//                           icon={<MoreHorizontal className="size-4" />}
//                           onClick={(e: React.MouseEvent) => e.stopPropagation()}
//                         />
//                       </Dropdown>
//                     </div>
//                   </Card>
//                 </Col>
//               ))}
//             </Row>
//           )}
//         </Card>
//       </div>

//       {/* Wallet Details Modal */}
//       <Modal
//         open={selectedWallet !== null}
//         onCancel={() => setSelectedWallet(null)}
//         footer={null}
//         width={600}
//         className="dark-modal"
//         closeIcon={
//           <X className="size-5 text-gray-400 transition-colors hover:text-white" />
//         }
//       >
//         {selectedWallet && (
//           <div className="p-6">
//             <h2 className="mb-6 text-xl font-semibold text-white">
//               Wallet Details
//             </h2>
//             <div className="space-y-4">
//               <div>
//                 <div className="text-sm text-gray-400">User</div>
//                 <div className="text-white">
//                   {userDetails[selectedWallet.userId]?.username || '...'}
//                   <span className="ml-2 text-sm text-gray-400">
//                     ({selectedWallet.userId})
//                   </span>
//                 </div>
//               </div>
//               <div>
//                 <div className="text-sm text-gray-400">Balance</div>
//                 <div className="text-xl text-white">
//                   {selectedWallet.balance.toLocaleString()}
//                   <span>đ</span>
//                 </div>
//               </div>
//               <div>
//                 <div className="text-sm text-gray-400">Status</div>
//                 <div
//                   className={`inline-block rounded-full px-2 py-1 text-xs font-medium
//                   ${getStatusConfig(selectedWallet.status).color} ${getStatusConfig(selectedWallet.status).bgColor
//                     }`}
//                 >
//                   {getStatusConfig(selectedWallet.status).text}
//                 </div>
//               </div>
//               <div>
//                 <div className="text-sm text-gray-400">Created Date</div>
//                 <div className="text-white">
//                   {format(new Date(selectedWallet.createdDate), 'PPP')}
//                 </div>
//               </div>
//               <div>
//                 <div className="text-sm text-gray-400">Last Updated</div>
//                 <div className="text-white">
//                   {format(new Date(selectedWallet.updatedDate), 'PPP')}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </Modal>
//     </ConfigProvider>
//   )
// }

// export default WalletList
