'use client'

import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Search, ArrowRight, Leaf, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import cosmeticApi from '@/lib/services/cosmeticApi'
import { CosmeticResponse } from '@/lib/types/Cosmetic'

// Reusing the existing QuizButton but with mobile styling
import QuizButton from './QuizButton'

const MobileLanding: React.FC = () => {
  const navigate = useNavigate()

  const {
    data: products,
    isLoading,
    error
  } = useQuery({
    queryKey: ['featured-products-mobile'],
    queryFn: async () => {
      const response = await cosmeticApi.getCosmetics()
      if (response.data.isSuccess && response.data.data) {
        // Get the items array from the paginated response
        const items = response.data.data.items || []
        // Return the first 3 items for featured products
        return items.slice(0, 3)
      }
      return []
    }
  })

  const handleStartQuiz = () => {
    navigate({ to: '/quiz' })
  }

  const handleViewProducts = () => {
    navigate({ to: '/shop' })
  }

  const handleProductClick = (productId: string) => {
    navigate({ to: '/shopDetails', search: { productId } })
  }

  // Format currency function from ProductCard
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      {/* Header and bottom nav are removed */}

      <main className="flex flex-1 flex-col gap-5 p-4 pt-6">
        {/* Welcome section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-xl bg-[#D1E2C4] p-4 shadow-sm"
        >
          <h2 className="text-xl font-medium text-[#3A4D39]">Hi there! 👋</h2>
          <p className="mt-1 text-[#3A4D39]/80">
            What would you like to do today?
          </p>

          {/* Quick action cards */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div
              onClick={handleStartQuiz}
              className="flex cursor-pointer flex-col items-center rounded-lg bg-white p-3 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-2 rounded-full bg-[#A7C4BC]/30 p-2">
                <Leaf className="size-5 text-[#739072]" />
              </div>
              <span className="text-sm font-medium text-[#3A4D39]">
                Take Skin Quiz
              </span>
            </div>

            <div
              onClick={handleViewProducts}
              className="flex cursor-pointer flex-col items-center rounded-lg bg-white p-3 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-2 rounded-full bg-[#E8F3D6]/40 p-2">
                <Search className="size-5 text-[#739072]" />
              </div>
              <span className="text-sm font-medium text-[#3A4D39]">
                Browse Products
              </span>
            </div>
          </div>
        </motion.section>

        {/* Featured products - horizontal scroll */}
        <section className="mt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-[#3A4D39]">
              Featured Products
            </h2>
            <button
              onClick={handleViewProducts}
              className="flex items-center text-sm text-[#739072]"
            >
              View all <ArrowRight className="ml-1 size-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="size-8 animate-spin text-[#3A4D39]" />
            </div>
          ) : error ? (
            <div className="mt-3 rounded-lg bg-rose-50 p-4 text-rose-500">
              Unable to load products. Please try again later.
            </div>
          ) : (
            <div className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto pb-2">
              {products && products.length > 0 ? (
                products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="shrink-0 cursor-pointer snap-start rounded-lg bg-white p-3 shadow-sm"
                    style={{ width: '160px' }}
                  >
                    <img
                      src={
                        product.thumbnailUrl ||
                        'https://cdn.builder.io/api/v1/image/assets/TEMP/placeholder.jpg'
                      }
                      alt={product.name}
                      className="h-32 w-full rounded-lg object-cover"
                    />
                    <h3 className="mt-2 line-clamp-1 font-medium text-[#3A4D39]">
                      {product.name}
                    </h3>
                    <p className="text-[#3A4D39]/80">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex h-40 w-full items-center justify-center text-[#3A4D39]/60">
                  No products available
                </div>
              )}
            </div>
          )}
        </section>

        {/* Prominent quiz section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-xl bg-gradient-to-br from-[#E8F3D6] to-[#A7C4BC]/40 p-5 shadow-sm"
        >
          <h2 className="text-xl font-medium text-[#3A4D39]">
            Discover Your Perfect Routine
          </h2>
          <p className="mt-2 text-[#3A4D39]/80">
            Take our 2-minute quiz to get personalized product recommendations
            based on your skin type.
          </p>
          <div className="mt-4 flex justify-center">
            <QuizButton
              onClick={handleStartQuiz}
              className="px-8 py-3 text-base"
            />
          </div>
        </motion.section>

        {/* Next steps section */}
        <section className="mb-4 mt-2">
          <h2 className="mb-3 text-lg font-medium text-[#3A4D39]">
            Explore More
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h3 className="font-medium text-[#3A4D39]">Skincare Journal</h3>
              <p className="mt-1 text-sm text-[#3A4D39]/80">
                Track your skincare journey
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h3 className="font-medium text-[#3A4D39]">Community</h3>
              <p className="mt-1 text-sm text-[#3A4D39]/80">
                Join skincare discussions
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default MobileLanding
