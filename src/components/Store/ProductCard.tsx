'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CosmeticResponse } from '@/lib/types/Cosmetic'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import cartApi from '@/lib/services/cartApi'

interface CosmeticCardProps {
  cosmetic: CosmeticResponse
  selectedProducts: CosmeticResponse[]
  toggleCompare: (product: CosmeticResponse) => void
  isSelectedForComparison: boolean
}

const ProductCard: React.FC<CosmeticCardProps> = ({
  cosmetic,
  toggleCompare,
  isSelectedForComparison
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const navigate = useNavigate()

  // Check if the product is on sale
  const isOnSale =
    cosmetic.originalPrice && cosmetic.originalPrice > cosmetic.price

  const handleQuickView = () => {
    navigate({
      to: '/shopDetails',
      search: {
        productId: cosmetic.id
      }
    })
  }

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true)

      // Use addToCart instead of updateCartItem
      const response = await cartApi.addToCart(cosmetic.id, 1)

      if (response.data.isSuccess) {
        toast.success(`${cosmetic.name} added to cart!`)
      } else {
        toast.error(response.data.message || 'Failed to add item to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Không thể thêm vào giỏ hàng')
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Format currency to VND
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  // Safely get the image URL
  const getImageUrl = () => {
    // First check for a dedicated thumbnailUrl
    if (cosmetic.thumbnailUrl) {
      return cosmetic.thumbnailUrl
    }

    // Then check for cosmetic images
    if (!cosmetic.cosmeticImages || cosmetic.cosmeticImages.length === 0) {
      return 'https://placehold.co/300x300/png?text=No+Image'
    }

    const firstImage = cosmetic.cosmeticImages[0]
    if (typeof firstImage === 'string') {
      return firstImage
    } else if (
      firstImage &&
      typeof firstImage === 'object' &&
      'imageUrl' in firstImage
    ) {
      return firstImage.imageUrl
    }

    return 'https://placehold.co/300x300/png?text=No+Image'
  }

  return (
    <motion.article
      className="relative flex h-full flex-col overflow-hidden rounded-lg bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => toggleCompare(cosmetic)}
        className={`absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-full border-2 transition-colors ${
          isSelectedForComparison
            ? 'bg-green-500 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-200'
        } shadow-md`}
      >
        {isSelectedForComparison ? '✓' : '+'}
      </motion.button>

      <motion.div className="relative mb-4 aspect-square overflow-hidden rounded-lg">
        <motion.img
          src={getImageUrl()}
          alt={cosmetic.name || 'Product image'}
          className="size-full object-cover transition-transform duration-300"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          onLoad={() => setImageLoading(false)}
        />
        {isOnSale && (
          <div className="absolute left-0 top-4 bg-rose-500 px-3 py-1 text-sm font-semibold text-white">
            Sale
          </div>
        )}
        <motion.button
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-6 py-2 text-sm font-medium text-[#3A4D39] shadow-lg transition-opacity duration-300 hover:bg-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          onClick={handleQuickView}
        >
          Quick View
        </motion.button>
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="size-8 animate-spin rounded-full border-4 border-[#3A4D39] border-t-transparent"></div>
          </div>
        )}
      </motion.div>

      <div className="z-10 w-full">
        <motion.div className="mb-2 flex items-center gap-1">
          {/* Rating stars removed */}
        </motion.div>

        <h3 className="mb-2 font-inter text-2xl font-medium text-[#3A4D39] transition-colors duration-300 hover:text-[#4A5D49]">
          {cosmetic.name || 'Unnamed Product'}
        </h3>
        <p className="mb-4 font-inter text-base leading-relaxed text-[#3A4D39]/70">
          {cosmetic.notice || ''}
        </p>
        <div className="mt-auto flex w-full items-center justify-between">
          <div className="flex flex-col">
            {isOnSale ? (
              <>
                <span className="text-sm font-medium text-gray-500 line-through">
                  {formatCurrency(cosmetic.originalPrice)}
                </span>
                <span className="font-inter text-xl font-semibold text-rose-600">
                  {formatCurrency(cosmetic.price)}
                </span>
              </>
            ) : (
              <span className="font-inter text-xl font-semibold text-[#3A4D39]">
                {formatCurrency(cosmetic.price)}
              </span>
            )}
          </div>
          {/* Add to Cart Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-[#3A4D39] px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-colors duration-300 hover:bg-[#4A5D49] disabled:opacity-50"
            aria-label={`Add ${cosmetic.name || 'product'} to cart`}
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}

export default ProductCard
