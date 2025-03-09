import React, { useState } from 'react'
import { motion } from 'framer-motion'
import StaffProductCard from './StaffProductCard'
import { useCosmetic } from '@/lib/context/CosmeticContext'
import { Loader2 } from 'lucide-react'
import { CosmeticResponse } from '@/lib/types/Cosmetic'
import Pagination from '../Store/Pagination'

const ITEMS_PER_PAGE = 12

interface StaffProductGridProps {
  onAddToOrder: (product: CosmeticResponse) => void
  searchQuery: string
}

const StaffProductGrid: React.FC<StaffProductGridProps> = ({
  onAddToOrder,
  searchQuery
}) => {
  const { filteredCosmetics, isLoading, error } = useCosmetic()
  const [currentPage, setCurrentPage] = useState(1)

  // Filter products based on search query
  const searchedCosmetics =
    filteredCosmetics?.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

  // Paginate after search filter
  const totalPages = Math.ceil(searchedCosmetics.length / ITEMS_PER_PAGE)
  const paginatedCosmetics = searchedCosmetics.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

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
        className="grid grid-cols-1 gap-6"
      >
        {paginatedCosmetics.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StaffProductCard product={product} onAddToOrder={onAddToOrder} />
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

export default StaffProductGrid
