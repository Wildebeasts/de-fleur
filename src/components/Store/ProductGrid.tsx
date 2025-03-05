import React, { useState } from 'react'
import { motion } from 'framer-motion'
import ProductCard from './ProductCard'
import { useCosmetic } from '@/lib/context/CosmeticContext'
import Pagination from './Pagination'
import { Loader2 } from 'lucide-react'

const ITEMS_PER_PAGE = 12 // Number of items per page

const ProductGrid: React.FC = () => {
  const { filteredCosmetics, isLoading, error } = useCosmetic()

  // Add this for debugging
  console.log('ProductGrid rendering with:', {
    filteredCosmetics,
    count: filteredCosmetics?.length || 0,
    isLoading,
    error
  })

  const [currentPage, setCurrentPage] = useState(1)

  console.log('ProductGrid received cosmetics:', filteredCosmetics?.length)

  // Calculate total pages
  const totalPages = Math.ceil(
    (filteredCosmetics?.length || 0) / ITEMS_PER_PAGE
  )

  // Get current page cosmetics
  const paginatedCosmetics =
    filteredCosmetics?.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    ) || []

  console.log('Paginated cosmetics:', paginatedCosmetics.length)

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#3A4D39]" />
        <span className="ml-2 text-lg text-[#3A4D39]">Loading products...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center text-red-500">
        <p className="text-lg font-medium">Error loading products</p>
        <p className="text-sm">{error.message}</p>
      </div>
    )
  }

  if (!filteredCosmetics || paginatedCosmetics.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <p className="text-lg text-[#3A4D39]">
          No products found matching your filters.
        </p>
      </div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {paginatedCosmetics.map((cosmetic, index) => (
          <motion.div
            key={cosmetic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ProductCard cosmetic={cosmetic} />
          </motion.div>
        ))}
      </motion.div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </>
  )
}

export default ProductGrid
