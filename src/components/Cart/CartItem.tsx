import React, { useState } from 'react'
import { toast } from 'sonner'
import { CartItem as CartItemType } from '@/lib/types/Cart'
import cartApi from '@/lib/services/cartApi'

interface CartItemProps {
  item: CartItemType
  allItems: CartItemType[] // Pass all cart items
  refreshCart: () => void // Function to refresh cart after update
}

const CartItem: React.FC<CartItemProps> = ({ item, allItems, refreshCart }) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [localQuantity, setLocalQuantity] = useState(item.quantity)

  // Handle quantity update with absolute values
  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      setIsUpdating(true)
      setLocalQuantity(newQuantity) // Update local state immediately for better UX

      // Create updated items list with the new quantity
      const updatedItems = allItems.map((cartItem) => {
        if (cartItem.cosmeticId === item.cosmeticId) {
          return {
            cosmeticId: cartItem.cosmeticId,
            quantity: newQuantity
          }
        }
        return {
          cosmeticId: cartItem.cosmeticId,
          quantity: cartItem.quantity
        }
      })

      // Update the entire cart with absolute quantities
      await cartApi.updateCart(updatedItems)
      refreshCart() // Refresh cart data after update
    } catch (error) {
      // Revert local state if API call fails
      setLocalQuantity(item.quantity)
      console.error('Error updating quantity:', error)
      toast.error('Không thể cập nhật số lượng')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveItem = async () => {
    try {
      setIsUpdating(true)
      await cartApi.removeCartItem(item.cosmeticId)
      refreshCart() // Refresh cart data after removal
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Không thể xóa sản phẩm')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center justify-between border-b border-gray-200 py-4">
      <div className="flex items-center">
        <img
          src={item.cosmeticImage}
          alt={item.cosmeticName}
          className="size-20 rounded-md object-cover"
        />
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-800">
            {item.cosmeticName}
          </h3>
          <p className="text-gray-600">{item.price.toLocaleString('vi-VN')}₫</p>
          <p className="text-sm text-gray-500">
            Subtotal: {item.subtotal.toLocaleString('vi-VN')}₫
          </p>
        </div>
      </div>

      <div className="flex items-center">
        <button
          className="rounded-l border px-3 py-1"
          onClick={() => handleUpdateQuantity(localQuantity - 1)}
          disabled={isUpdating || localQuantity <= 1}
        >
          -
        </button>
        <span className="border-y px-4 py-1">{localQuantity}</span>
        <button
          className="rounded-r border px-3 py-1"
          onClick={() => handleUpdateQuantity(localQuantity + 1)}
          disabled={isUpdating}
        >
          +
        </button>
      </div>

      <button
        className="ml-4 text-red-500"
        onClick={handleRemoveItem}
        disabled={isUpdating}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  )
}

export default CartItem
