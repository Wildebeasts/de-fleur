import React, { useState } from 'react'
import { motion } from 'framer-motion'
import ProductCard from './ProductCard'
import { useCosmetic } from '@/lib/context/CosmeticContext'
import Pagination from './Pagination'
import { Loader2 } from 'lucide-react'

// interface Product {
//   id: string
//   title: string
//   description: string
//   price: string
//   imageSrc: string
//   isNew?: boolean
//   rating?: number
//   reviewCount?: number
// }

const ITEMS_PER_PAGE = 12 // Number of items per page

const ProductGrid: React.FC = () => {
  // Sample product data - replace with your actual data
  // const products: Product[] = [
  //   {
  //     id: '1',
  //     title: 'Vitamin C Brightening Serum',
  //     description: 'Advanced formula for radiant skin',
  //     price: '$68.00',
  //     imageSrc:
  //       'https://cdn.builder.io/api/v1/image/assets/TEMP/5601b244a695bdf6e6696f50c1b6d1beeb7b5877098233b16a614080b6cb9ccc?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
  //     isNew: true,
  //     rating: 4.5,
  //     reviewCount: 124
  //   }
  //   // Add more products...
  // ]

  const { filteredCosmetics, isLoading, error } = useCosmetic()

  const [currentPage, setCurrentPage] = useState(1)

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

  if (paginatedCosmetics.length === 0) {
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </>
  )
}

export default ProductGrid
