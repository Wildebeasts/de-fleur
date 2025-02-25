'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CosmeticResponse } from '@/lib/types/Cosmetic'
import { useNavigate } from '@tanstack/react-router'
import { useCart } from '@/lib/context/CartContext'
import { toast } from 'sonner'

interface CosmeticCardProps {
  cosmetic: CosmeticResponse
}

const ProductCard: React.FC<CosmeticCardProps> = ({ cosmetic }) => {
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()

  const handleQuickView = () => {
    navigate({
      to: '/shopDetails',
      search: {
        productId: cosmetic.id
      }
    })
  }
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    // Create a cart item from the cosmetic product
    const cartItem = {
      id: cosmetic.id,
      name: cosmetic.name,
      price: cosmetic.price,
      quantity: 1,
      imageUrl: cosmetic.cosmeticImages?.[0] || '',
      ingredients: cosmetic.ingredients,
      cosmeticType: cosmetic.cosmeticType as string,
      brand: cosmetic.brand as string
    }

    // Add the item to the cart
    addToCart(cartItem)

    // Show success message
    toast.success(`${cosmetic.name} added to cart!`)
  }

  return (
    <motion.article
      className="relative flex w-full flex-col items-start rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative mb-6 w-full overflow-hidden rounded-xl bg-[#F9F5F0]">
        {/* {isNew && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute left-4 top-4 z-10 rounded-full bg-[#D1E2C4] px-3 py-1 text-sm font-medium text-[#3A4D39]"
          >
            New
          </motion.div>
        )} */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F9F5F0]/50 to-transparent" />
        <motion.div
          className="relative aspect-square"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <img
            loading="lazy"
            src={
              cosmetic.cosmeticImages?.[0] ||
              'https://cdn.builder.io/api/v1/image/assets/TEMP/5601b244a695bdf6e6696f50c1b6d1beeb7b5877098233b16a614080b6cb9ccc?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e'
            }
            alt={cosmetic.name}
            src={
              cosmetic.cosmeticImages[0] ||
              'https://cdn.builder.io/api/v1/image/assets/TEMP/5601b244a695bdf6e6696f50c1b6d1beeb7b5877098233b16a614080b6cb9ccc'
            }
            alt={cosmetic.name}
            className="size-full object-cover"
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
                className="rounded-full bg-white px-6 py-2 text-sm font-medium text-[#3A4D39] shadow-lg transition-all duration-300 hover:bg-[#3A4D39] hover:text-white"
                onClick={handleQuickView}
              >
                Quick View
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute right-8 top-8"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="rounded-full bg-white/80 p-2 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-[#3A4D39] hover:text-white"
          aria-label="Add to wishlist"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </motion.button>
      </motion.div>

      <div className="z-10 w-full">
        <motion.div className="mb-2 flex items-center gap-1">
          {/* {[...Array(5)].map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: i < Math.floor(rating) ? 1 : 0.3 }}
              className="text-yellow-400"
            >
              ★
            </motion.span>
          ))}
          <span className="ml-2 text-sm text-gray-500">({reviewCount})</span> */}
        </motion.div>

        <h3 className="mb-2 font-inter text-2xl font-medium text-[#3A4D39] transition-colors duration-300 hover:text-[#4A5D49]">
          {cosmetic.name}
        </h3>
        <p className="mb-4 font-inter text-base leading-relaxed text-[#3A4D39]/70">
          {cosmetic.notice}
        </p>
        <div className="mt-auto flex w-full items-center justify-between">
          <p className="font-inter text-xl font-semibold text-[#3A4D39]">
            ${cosmetic.price}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-[#3A4D39] px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-colors duration-300 hover:bg-[#4A5D49]"
            aria-label={`Add ${cosmetic.name} to cart`}
            onClick={handleAddToCart}
          >
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}

export default ProductCard
