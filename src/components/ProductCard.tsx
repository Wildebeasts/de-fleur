'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface ProductCardProps {
  imageSrc: string
  title: string
  description: string
  price: string
  id?: string
  onQuickView?: () => void
}

export const ProductCard: React.FC<ProductCardProps> = ({
  imageSrc,
  title,
  description,
  price,
  onQuickView
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering parent click
    if (onQuickView) {
      onQuickView()
    }
  }

  return (
    <motion.article
      className="relative flex w-full flex-col items-start rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
    >
      <div className="relative mb-6 w-full overflow-hidden rounded-xl bg-[#F9F5F0]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F9F5F0]/50 to-transparent" />
        <motion.div
          className="relative aspect-square"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <img
            loading="lazy"
            src={imageSrc}
            alt={title}
            className="size-full object-cover"
          />
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/5"
            >
              <button
                className="rounded-full bg-white px-6 py-2 text-sm font-medium text-[#3A4D39] shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#3A4D39] hover:text-white"
                onClick={handleQuickViewClick}
              >
                Quick View
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="absolute right-8 top-8">
        <button
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
        </button>
      </div>

      <div className="z-0 w-full">
        <h3 className="mb-2 font-inter text-2xl font-medium text-[#3A4D39] transition-colors duration-300 hover:text-[#4A5D49]">
          {title}
        </h3>
        <p className="mb-4 font-inter text-base leading-relaxed text-[#3A4D39]/70">
          {description}
        </p>
        <div className="mt-auto flex w-full items-center justify-between">
          <p className="font-inter text-xl font-semibold text-[#3A4D39]">
            {price}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-[#3A4D39] px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-colors duration-300 hover:bg-[#4A5D49]"
            aria-label={`Add ${title} to cart`}
          >
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}
