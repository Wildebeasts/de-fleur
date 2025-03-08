import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import ProductGrid from '@/components/Store/ProductGrid'
import FilterSidebar from '@/components/Store/FilterSidebar'
import cosmeticApi from '@/lib/services/cosmeticApi'
import { CosmeticProvider } from '@/lib/context/CosmeticContext'
import { CosmeticFilter } from '@/lib/types/CosmeticFilter'
import Breadcrumb from '@/components/Store/Breadcrumb'

const ITEMS_PER_PAGE = 12

const ShopSearchPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [filters, setFilters] = useState<CosmeticFilter>({})
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCosmeticTypes, setSelectedCosmeticTypes] = useState<string[]>(
    []
  )
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<number[]>([0, 4000000])

  // Fetch cosmetics with pagination from the API
  const { data, isLoading, error } = useQuery({
    queryKey: ['cosmetics', currentPage, sortColumn, sortOrder, filters],
    queryFn: async () => {
      const response = await cosmeticApi.getCosmetics(
        currentPage,
        ITEMS_PER_PAGE,
        sortColumn,
        sortOrder,
        filters.name,
        filters.brandId,
        filters.skinTypeId,
        filters.cosmeticTypeId,
        filters.gender,
        filters.minPrice,
        filters.maxPrice
      )

      if (response.data.isSuccess) {
        return response.data.data
      }
      throw new Error('Failed to fetch products')
    }
  })

  // Handle sort change
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    if (value === 'price-asc') {
      setSortColumn('price')
      setSortOrder('asc')
    } else if (value === 'price-desc') {
      setSortColumn('price')
      setSortOrder('desc')
    } else if (value === 'name-asc') {
      setSortColumn('name')
      setSortOrder('asc')
    } else if (value === 'name-desc') {
      setSortColumn('name')
      setSortOrder('desc')
    } else if (value === 'rating-desc') {
      setSortColumn('rating')
      setSortOrder('desc')
    }
  }

  // Handle filter change
  const handleFilterChange = (newFilters: CosmeticFilter) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb />
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#3A4D39]">All Products</h1>
          <select
            id="sort"
            className="rounded-md border border-[#D1E2C4] bg-white px-3 py-2 text-sm text-[#3A4D39] focus:border-[#3A4D39] focus:outline-none"
            onChange={handleSortChange}
            defaultValue="name-asc"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="rating-desc">Best Rated</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <FilterSidebar onFilterChange={handleFilterChange} />
          </div>

          <div className="lg:col-span-3">
            <CosmeticProvider
              value={{
                filteredCosmetics: data?.items || [],
                isLoading,
                error: error as Error,
                totalPages: data?.totalPages || 1,
                currentPage,
                onPageChange: setCurrentPage,
                selectedCategories,
                setSelectedCategories,
                selectedBrands,
                setSelectedBrands,
                selectedCosmeticTypes,
                setSelectedCosmeticTypes,
                selectedConcerns,
                setSelectedConcerns,
                priceRange,
                setPriceRange
              }}
            >
              <ProductGrid />
            </CosmeticProvider>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopSearchPage
