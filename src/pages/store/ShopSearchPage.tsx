/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import ProductGrid from '@/components/Store/ProductGrid'
import FilterSidebar from '@/components/Store/FilterSidebar'
import cosmeticApi from '@/lib/services/cosmeticApi'
import { CosmeticProvider } from '@/lib/context/CosmeticContext'
import { CosmeticFilter } from '@/lib/types/CosmeticFilter'
import Breadcrumb from '@/components/Store/Breadcrumb'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { debounce } from 'lodash'

const ITEMS_PER_PAGE = 12

// Add this type definition
type SearchParams = {
  name?: string
}

const ShopSearchPage: React.FC = () => {
  const queryClient = useQueryClient()
  const search = useSearch({ from: '/shop' }) as SearchParams
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE)
  const [sortColumn, setSortColumn] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [filters, setFilters] = useState<CosmeticFilter>({
    name: search.name || undefined
  })
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCosmeticTypes, setSelectedCosmeticTypes] = useState<string[]>(
    []
  )
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<number[]>([0, 4000000])
  const [searchTerm, setSearchTerm] = useState(search.name || '')
  const navigate = useNavigate()

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [
    filters,
    selectedBrands,
    selectedCategories,
    selectedCosmeticTypes,
    selectedConcerns,
    priceRange,
    sortColumn,
    sortOrder
  ])

  // Build complete filter object from all filter states
  useEffect(() => {
    const updatedFilters: CosmeticFilter = {
      name: search.name || undefined,
      brandId: selectedBrands.length > 0 ? selectedBrands.join(',') : undefined,
      skinTypeId:
        selectedCategories.length > 0
          ? selectedCategories.join(',')
          : undefined,
      cosmeticTypeId:
        selectedCosmeticTypes.length > 0
          ? selectedCosmeticTypes.join(',')
          : undefined,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 4000000 ? priceRange[1] : undefined
    }

    setFilters(updatedFilters)
  }, [
    search.name,
    selectedBrands,
    selectedCategories,
    selectedCosmeticTypes,
    selectedConcerns,
    priceRange
  ])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'cosmetics',
      currentPage,
      pageSize,
      sortColumn,
      sortOrder,
      filters
    ],
    queryFn: async () => {
      const response = await cosmeticApi.getCosmetics(
        currentPage,
        pageSize,
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

  // Handle page change with API refresh
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // Function to refresh cosmetics data
  const refreshCosmetics = useCallback(() => {
    refetch()
  }, [refetch])

  // Handle input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    // Only update URL on input change if you want real-time URL updates
    // Otherwise, remove this section to only update URL on submit

    // Use debounce for preview results if desired
    debouncedSearch(value)
  }

  // Create a debounced search function for API calls
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      if (!term || term.trim() === '') {
        fetchAllCosmetics()
      } else {
        searchCosmetics(term)
      }
    }, 500),
    []
  )

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Cancel any pending debounced search
    debouncedSearch.cancel()

    // Check if search term is empty
    if (!searchTerm || searchTerm.trim() === '') {
      // For empty search, use window.history to directly modify URL
      window.history.replaceState(null, '', '/shop')

      // Then navigate to ensure router state is updated
      navigate({
        to: '/shop',
        replace: true
      })

      // Fetch all products
      fetchAllCosmetics()

      console.log('Cleared search parameters, navigating to /shop')
    } else {
      // For non-empty search
      navigate({
        to: '/shop',
        search: { q: searchTerm },
        replace: true
      })
      searchCosmetics(searchTerm)
    }
  }

  // Separate functions for API calls
  const fetchAllCosmetics = () => {
    // Your API call to get all cosmetics
  }

  const searchCosmetics = (term: string) => {
    // Your API call to search cosmetics
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
            onChange={(e) => {
              const [column, order] = e.target.value.split('-')
              setSortColumn(column)
              setSortOrder(order)
            }}
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
            <FilterSidebar onFilterChange={setFilters} />
          </div>

          <div className="lg:col-span-3">
            <CosmeticProvider
              value={{
                filteredCosmetics: data?.items || [],
                isLoading,
                error: error as Error,

                // Pagination
                totalPages: data?.totalPages || 1,
                currentPage,
                onPageChange: handlePageChange,

                // Filters
                filters,
                setFilters,
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
