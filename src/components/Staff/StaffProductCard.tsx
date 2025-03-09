import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { CosmeticResponse } from '@/lib/types/Cosmetic'

interface StaffProductCardProps {
  product: CosmeticResponse
  onAddToOrder: (product: CosmeticResponse) => void
}

const StaffProductCard: React.FC<StaffProductCardProps> = ({
  product,
  onAddToOrder
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToOrder = async () => {
    try {
      setIsAdding(true)
      onAddToOrder(product)
      toast.success(`${product.name} added to order!`)
    } catch (error) {
      toast.error('Failed to add product to order')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <motion.article
      className="relative flex w-full items-center gap-6 rounded-2xl bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-xl"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Product Image */}
      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-[#F9F5F0]">
        <motion.img
          src={product.thumbnailUrl!}
          alt={product.name}
          className="size-full object-cover"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
        />
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/5"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-[#3A4D39] shadow-md transition-all duration-300 hover:bg-[#3A4D39] hover:text-white"
            >
              Quick View
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex grow flex-col">
        <h3 className="text-lg font-semibold text-[#3A4D39] transition-colors duration-300 hover:text-[#4A5D49]">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600">{product.notice}</p>
        <p className="mt-1 text-lg font-bold text-[#3A4D39]">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(product.price)}
        </p>
      </div>

      {/* Add to Order Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="rounded-full bg-[#3A4D39] px-5 py-2 text-sm font-medium text-white shadow-lg transition-colors duration-300 hover:bg-[#4A5D49] disabled:opacity-50"
        onClick={handleAddToOrder}
        disabled={isAdding}
      >
        {isAdding ? 'Adding...' : 'Add'}
      </motion.button>
    </motion.article>
  )
}

export default StaffProductCard
