import React, { useState } from 'react'
import { toast } from 'sonner'

interface CartItemData {
  cosmeticId: string
  cosmeticName: string
  cosmeticImage: string
  price: number
  quantity: number
  subtotal: number
  weight: number
  length: number
  width: number
  height: number
}

interface CartItemProps {
  item: CartItemData
  updateQuantity: (cosmeticId: string, quantity: number) => Promise<void>
  removeItem: (cosmeticId: string) => Promise<void>
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  updateQuantity,
  removeItem
}) => {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      setIsUpdating(true)
      await updateQuantity(item.cosmeticId, newQuantity)
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Không thể cập nhật số lượng')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveItem = async () => {
    try {
      setIsUpdating(true)
      await removeItem(item.cosmeticId)
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Không thể xóa sản phẩm')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center border-b py-4">
      <img
        src={item.cosmeticImage}
        alt={item.cosmeticName}
        className="w-20 h-20 object-cover rounded"
      />

      <div className="ml-4 flex-grow">
        <h3 className="font-medium">{item.cosmeticName}</h3>
        <p className="text-[#3A4D39] font-semibold">
          {item.price.toLocaleString('vi-VN')}₫
        </p>
        <p className="text-sm text-gray-500">
          Subtotal: {item.subtotal.toLocaleString('vi-VN')}₫
        </p>
      </div>

      <div className="flex items-center">
        <button
          className="px-3 py-1 border rounded-l"
          onClick={() => handleUpdateQuantity(item.quantity - 1)}
          disabled={isUpdating}
        >
          -
        </button>
        <span className="px-4 py-1 border-t border-b">{item.quantity}</span>
        <button
          className="px-3 py-1 border rounded-r"
          onClick={() => handleUpdateQuantity(item.quantity + 1)}
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
