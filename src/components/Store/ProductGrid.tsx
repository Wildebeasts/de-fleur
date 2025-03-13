import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useCosmetic } from '@/lib/context/CosmeticContext'
import ProductCard from './ProductCard'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { Loader2 } from 'lucide-react'
import CompareProducts from './CompareProducts'
import { CosmeticResponse } from '@/lib/types/Cosmetic'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const ProductGrid: React.FC = () => {
  const {
    filteredCosmetics,
    isLoading,
    error,
    currentPage,
    totalPages,
    onPageChange
  } = useCosmetic()

  const [selectedProducts, setSelectedProducts] = useState<CosmeticResponse[]>(
    []
  )

  const toggleCompare = (product: CosmeticResponse) => {
    setSelectedProducts((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id) // Deselect product
      }
      return prev.length < 2 ? [...prev, product] : prev // Limit to 2 products
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-12 animate-spin text-rose-300" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <p className="text-lg font-medium text-red-500">
          Error loading products
        </p>
        <p className="text-gray-500">{error.message}</p>
      </div>
    )
  }

  if (!filteredCosmetics || filteredCosmetics.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-lg font-medium text-gray-500">
          No products found matching your criteria
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
    <div className="space-y-8">
      {/* Product Comparison Section */}
      <CompareProducts
        selectedProducts={selectedProducts}
        setSelectedProducts={setSelectedProducts}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filteredCosmetics.map((cosmetic) => (
          <ProductCard
            key={cosmetic.id}
            cosmetic={cosmetic}
            selectedProducts={selectedProducts}
            toggleCompare={toggleCompare}
            isSelectedForComparison={selectedProducts.some(
              (p) => p.id === cosmetic.id
            )}
          />
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
    </div>
  )
}

export default ProductGrid
