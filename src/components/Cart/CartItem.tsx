import React, { useState, useEffect } from 'react'
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
  const [inputValue, setInputValue] = useState(item.quantity.toString())

  // Update local state when item changes from parent
  useEffect(() => {
    setLocalQuantity(item.quantity)
    setInputValue(item.quantity.toString())
  }, [item.quantity])

  // Handle quantity update with absolute values
  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      setIsUpdating(true)
      setLocalQuantity(newQuantity) // Update local state immediately for better UX
      setInputValue(newQuantity.toString())

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
      setInputValue(item.quantity.toString())
      console.error('Error updating quantity:', error)
      toast.error('Không thể cập nhật số lượng')
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Only allow numeric input
    if (/^\d*$/.test(value)) {
      setInputValue(value)
    }
  }

  // Handle input blur (when user finishes editing)
  const handleInputBlur = () => {
    const newQuantity = parseInt(inputValue, 10)

    // Validate input
    if (isNaN(newQuantity) || newQuantity < 1) {
      // Reset to previous valid quantity
      setInputValue(localQuantity.toString())
      return
    }

    // Only update if quantity changed
    if (newQuantity !== localQuantity) {
      handleUpdateQuantity(newQuantity)
    }
  }

  // Handle key press (Enter key)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur() // Trigger blur event to update
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
    <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 py-4 sm:flex-row sm:items-center">
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
          {item.discountPercentage > 0 ? (
            <div>
              <p className="text-gray-400 line-through">
                {item.price.toLocaleString('vi-VN')}₫
              </p>
              <p className="text-red-600">
                {item.discountedPrice.toLocaleString('vi-VN')}₫
                <span className="ml-2 text-sm">
                  (-{item.discountPercentage.toFixed(0)}%)
                </span>
              </p>
            </div>
          ) : (
            <p className="text-gray-600">
              {item.price.toLocaleString('vi-VN')}₫
            </p>
          )}
          <p className="text-sm text-gray-500">
            Tổng: {item.discountedSubtotal.toLocaleString('vi-VN')}₫
          </p>
        </div>
      </div>

      <div className="flex items-center">
        <div className="flex items-center overflow-hidden rounded-md border">
          <button
            className="bg-gray-100 px-3 py-1 transition-colors hover:bg-gray-200"
            onClick={() => handleUpdateQuantity(localQuantity - 1)}
            disabled={isUpdating || localQuantity <= 1}
          >
            -
          </button>

          <input
            type="text"
            className="w-12 border-x py-1 text-center focus:outline-none"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyPress}
            disabled={isUpdating}
            aria-label="Quantity"
          />

          <button
            className="bg-gray-100 px-3 py-1 transition-colors hover:bg-gray-200"
            onClick={() => handleUpdateQuantity(localQuantity + 1)}
            disabled={isUpdating}
          >
            +
          </button>
        </div>

        <button
          className="ml-4 text-red-500 transition-colors hover:text-red-700"
          onClick={handleRemoveItem}
          disabled={isUpdating}
          aria-label="Remove item"
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
    </div>
  )
}

export default CartItem
