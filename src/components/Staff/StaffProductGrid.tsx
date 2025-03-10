/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { motion } from 'framer-motion'
import StaffProductCard from './StaffProductCard'
import { useCosmetic } from '@/lib/context/CosmeticContext'
import { Loader2 } from 'lucide-react'
import { CosmeticResponse } from '@/lib/types/Cosmetic'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'

interface StaffProductGridProps {
  onAddToOrder: (product: CosmeticResponse) => void
}

const StaffProductGrid: React.FC<StaffProductGridProps> = ({
  onAddToOrder
}) => {
  const {
    filteredCosmetics,
    isLoading,
    error,
    currentPage,
    totalPages,
    onPageChange
  } = useCosmetic()

  // Add this for debugging
  console.log('ProductGrid rendering with:', {
    filteredCosmetics,
    count: filteredCosmetics?.length || 0,
    isLoading,
    error
  })

  console.log('ProductGrid received cosmetics:', filteredCosmetics?.length)

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

  if (!filteredCosmetics || filteredCosmetics.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <p className="text-lg text-[#3A4D39]">
          No products found matching your filters.
        </p>
      </div>
    )
  }

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // First page
    if (startPage > 1) {
      items.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
        </PaginationItem>
      )

      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <span className="px-4 py-2">...</span>
          </PaginationItem>
        )
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={currentPage === i}
            onClick={() => onPageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <span className="px-4 py-2">...</span>
          </PaginationItem>
        )
      }

      items.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return items
  }

  // Calculate if we have previous/next pages
  const hasPreviousPage = currentPage > 1
  const hasNextPage = currentPage < totalPages

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 gap-6"
      >
        {filteredCosmetics.map((product, index) => (
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
        <Pagination className="mt-8">
          <PaginationContent>
            {hasPreviousPage && (
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(currentPage - 1)}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}

            {renderPaginationItems()}

            {hasNextPage && (
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(currentPage + 1)}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </>
  )
}

export default StaffProductGrid
