/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable tailwindcss/no-custom-classname */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react'
import {
  Row,
  Col,
  Modal,
  message,
  Spin,
  Card,
  Empty,
  ConfigProvider,
  theme
} from 'antd'
import { ShoppingCart, X } from 'lucide-react'
import { BreadcrumbUpdater } from '@/components/BreadcrumbUpdater'
import cartApi from '@/lib/services/cartApi'
import userApi, { UserDto } from '@/lib/services/userService'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { CartResponse } from '@/lib/types/Cart'
import cosmeticApi from '@/lib/services/cosmeticApi'

const CartList: React.FC = () => {
  const [selectedCart, setSelectedCart] = useState<CartResponse | null>(null)
  const [pagination] = useState({
    current: 1,
    pageSize: 12
  })
  const navigate = useNavigate()

  // Fetch carts with TanStack Query and error handling
  const { data: cartsData, isLoading: isCartsLoading, error: cartsError } = useQuery({
    queryKey: ['carts'],
    queryFn: async () => {
      const response = await cartApi.getAllCarts()

      if (!response.data.isSuccess) {
        if (response.data.message === "Authentication Required Or Failed.") {
          message.error('Please login to view carts')
          navigate({ to: '/login', search: { redirect: '/admin' } })
          throw new Error('Authentication required')
        }
        throw new Error(response.data.message || 'Failed to fetch carts')
      }

      return response.data.data || []
    },
    retry: false,
    networkMode: 'online'
  })

  // Show error message when error occurs
  useEffect(() => {
    if (cartsError instanceof Error) {
      message.error(cartsError.message)
    }
  }, [cartsError])

  // Fetch user details only if we have authenticated cart data
  useQuery({
    queryKey: ['userDetails', cartsData],
    enabled: !!cartsData && cartsData.length > 0,
    queryFn: async () => {
      try {
        const userIds = cartsData
          ?.map((cart) => cart.customer?.id)
          .filter((id): id is string => id !== null && id !== undefined) || []

        if (userIds.length === 0) return {}

        const details = await Promise.all(
          userIds.map((id) => userApi.getUserById(id))
        )
        return details.reduce(
          (acc, user) => {
            if (user && user.id) {
              acc[user.id] = user
            }
            return acc
          },
          {} as Record<string, UserDto>
        )
      } catch (error) {
        console.error('Error fetching user details:', error)
        return {}
      }
    }
  })

  // Add this query to fetch cosmetic details when a cart is selected
  const { data: cosmeticDetails } = useQuery({
    queryKey: ['cosmeticDetails', selectedCart?.id],
    enabled: !!selectedCart,
    queryFn: async () => {
      try {
        if (!selectedCart) return {}

        const cosmeticIds = selectedCart.items
          .map(item => item.cosmeticId)
          .filter(id => id !== null && id !== undefined)

        if (cosmeticIds.length === 0) return {}

        const details = await Promise.all(
          cosmeticIds.map(id => cosmeticApi.getCosmeticById(id))
        )

        return details.reduce((acc, cosmetic) => {
          if (cosmetic && cosmetic.data && cosmetic.data.isSuccess && cosmetic.data.data) {
            acc[cosmetic.data.data.id] = cosmetic.data.data
          }
          return acc
        }, {} as Record<string, any>)
      } catch (error) {
        console.error('Error fetching cosmetic details:', error)
        return {}
      }
    }
  })

  const getStatusConfig = (itemCount: number) => {
    if (itemCount === 0) {
      return {
        color: 'text-gray-400',
        bgColor: 'bg-gray-400/10',
        text: 'EMPTY'
      }
    }
    return {
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
      text: 'ACTIVE'
    }
  }

  const getCardGradient = (index: number) => {
    const gradients = [
      'from-blue-500/90 via-blue-600/90 to-blue-700/90',
      'from-purple-500/90 via-purple-600/90 to-purple-700/90',
      'from-emerald-500/90 via-emerald-600/90 to-emerald-700/90',
      'from-orange-500/90 via-red-500/90 to-red-600/90'
    ]
    return gradients[index % gradients.length]
  }

  const getCurrentPageData = () => {
    if (!cartsData) return []
    const startIndex = (pagination.current - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize
    return cartsData.slice(startIndex, endIndex)
  }

  // Add this function to calculate the subtotal
  const calculateSubtotal = (items: any[]) => {
    return items.reduce((sum, item) => {
      // For each item, multiply its price by quantity
      return sum + (item.price * item.quantity);
    }, 0);
  };

  // Add this function to calculate shipping
  const calculateShipping = () => {
    // Standard shipping fee
    return 70000;
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgBase: '#0d1117',
          colorText: '#ffffff'
        }
      }}
    >
      <BreadcrumbUpdater
        items={['Admin Dashboard', 'Carts', 'All Carts']}
        previousItems={['Admin Dashboard', 'Carts']}
      />

      <div className="mx-auto mt-32 w-4/5">
        <Card
          title={
            <div className="my-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#282d35] p-2">
                  <ShoppingCart className="size-5 text-blue-400" />
                </div>
                <span className="text-lg font-semibold text-white">
                  Shopping Carts
                </span>
              </div>
            </div>
          }
          className="rounded-xl border border-gray-100/10 bg-[#1a1b24]"
        >
          {isCartsLoading ? (
            <div className="p-12 text-center">
              <Spin size="large" />
            </div>
          ) : cartsError ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-gray-400">
                      {cartsError instanceof Error ? cartsError.message : 'Error loading carts'}
                    </span>
                  </div>
                }
                className="text-gray-400"
              />
            </div>
          ) : !cartsData?.length ? (
            <Empty description="No carts found" />
          ) : (
            <Row gutter={[16, 16]}>
              {getCurrentPageData().map((cart, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={cart.id}>
                  <Card
                    hoverable
                    className={`relative overflow-hidden bg-gradient-to-br ${getCardGradient(
                      index
                    )}
                      group h-[220px] cursor-pointer rounded-2xl border border-white/10
                      backdrop-blur-sm transition-all duration-300`}
                    onClick={() => setSelectedCart(cart)}
                  >
                    <div className="absolute left-4 top-4">
                      <div className="mb-1 text-sm font-medium text-white/60">
                        Cart ID
                      </div>
                      <div className="text-lg font-medium tracking-wider text-white">
                        {cart.id.slice(-8)}
                      </div>
                    </div>

                    <div className="absolute right-4 top-4">
                      <div
                        className={`rounded-full border border-white/20 px-4 py-1.5
                        text-xs font-medium backdrop-blur-sm
                        ${getStatusConfig(cart.items.length).color}`}
                      >
                        {getStatusConfig(cart.items.length).text}
                      </div>
                    </div>

                    <div className="absolute bottom-[5.5rem] left-4">
                      <div className="mb-1 text-sm font-medium text-white/60">
                        Customer
                      </div>
                      <div className="text-lg font-medium text-white">
                        {cart.customer?.userName || 'Guest'}
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4">
                      <div className="mb-1 text-sm font-medium text-white/60">
                        Total
                      </div>
                      <div className="flex items-center gap-1 text-2xl font-bold text-white">
                        {cart.totalPrice > 0
                          ? cart.totalPrice.toLocaleString()
                          : "0"}
                        <span className="text-xl">đ</span>
                      </div>
                    </div>

                    <div className="absolute bottom-4 right-4">
                      <div className="text-sm font-medium text-white/60">
                        {cart.items.length} items
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card>
      </div>

      <Modal
        open={selectedCart !== null}
        onCancel={() => setSelectedCart(null)}
        footer={null}
        width={700}
        className="dark-modal"
        closeIcon={
          <X className="size-5 text-gray-400 transition-colors hover:text-white" />
        }
      >
        {selectedCart && (
          <div className="p-6">
            <h2 className="mb-6 flex items-center text-2xl font-semibold text-white">
              <ShoppingCart className="mr-3 size-5 text-blue-400" />
              Cart Details
            </h2>

            <div className="space-y-6">
              {/* Customer Info */}
              <div className="rounded-lg bg-gray-800/40 p-4">
                <div className="text-sm font-medium text-blue-400">Customer</div>
                <div className="mt-1 text-lg text-white">
                  {selectedCart.customer?.userName || 'Guest User'}
                </div>
                <div className="mt-1 text-sm text-gray-400">
                  {selectedCart.customer?.email || 'No email provided'}
                </div>
              </div>

              {/* Items */}
              <div className="rounded-lg bg-gray-800/40 p-4">
                <div className="mb-3 text-sm font-medium text-blue-400">Items</div>
                <div className="mt-2 space-y-3">
                  {selectedCart.items.map((item) => (
                    <div
                      key={item.cosmeticId}
                      className="flex items-center justify-between rounded-md bg-gray-700/30 p-3 text-white"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex size-10 items-center justify-center rounded-md bg-blue-500/20">
                          <ShoppingCart className="size-5 text-blue-400" />
                        </div>
                        <div>
                          <span className="font-medium">
                            {cosmeticDetails?.[item.cosmeticId]?.name || `Product ${item.cosmeticId.slice(-8)}`}
                          </span>
                          <span className="ml-2 text-sm text-gray-400">× {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-medium">{item.price.toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-lg bg-gray-800/40 p-4">
                <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                  <span className="text-sm text-gray-400">Subtotal</span>
                  <span className="text-white">
                    {calculateSubtotal(selectedCart.items).toLocaleString()}đ
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-700 py-3">
                  <span className="text-sm text-gray-400">Shipping</span>
                  <span className="text-white">
                    {calculateShipping().toLocaleString()}đ
                  </span>
                </div>

                {selectedCart.eventDiscountTotal > 0 && (
                  <div className="flex items-center justify-between border-b border-gray-700 py-3">
                    <span className="text-sm text-gray-400">Discount</span>
                    <span className="text-green-400">-{selectedCart.eventDiscountTotal.toLocaleString()}đ</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3">
                  <span className="text-sm font-medium text-blue-400">Total</span>
                  <span className="text-xl font-bold text-white">
                    {(calculateSubtotal(selectedCart.items) + calculateShipping()).toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </ConfigProvider>
  )
}

export default CartList
