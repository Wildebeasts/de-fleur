/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import StaffProductGrid from './StaffProductGrid'
import { CosmeticResponse } from '@/lib/types/Cosmetic'
import OrderSummary from './OrderSummary'
import { CosmeticProvider } from '@/lib/context/CosmeticContext'
import { CosmeticFilter } from '@/lib/types/CosmeticFilter'
import { useQuery } from '@tanstack/react-query'
import cosmeticApi from '@/lib/services/cosmeticApi'
import Breadcrumb from '../Store/Breadcrumb'
import CosmeticSearch from './CosmeticSearch'
import CustomerScreen from './CustomerScreen'
import { CouponResponse } from '@/lib/types/Coupon'
import { motion } from 'framer-motion'

const ITEMS_PER_PAGE = 12

// Define a new type for the selected products with quantity
type SelectedProduct = CosmeticResponse & { quantity: number }

const ProductSelectionAndOrder = () => {
  const [customerViewOpen, setCustomerViewOpen] = useState(false)
  const handleOpenCustomerScreen = () => {
    setCustomerViewOpen(true)
  }
  const handleCloseCustomerScreen = () => {
    setCustomerViewOpen(false) // Allow reopening the window
  }
  const [coupon, setCoupon] = useState<CouponResponse | null>(null)
  const [customerName, setCustomerName] = useState<string>('')
  const [customerPhoneNumber, setPhoneNumber] = useState<string>('')

  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [filters] = useState<CosmeticFilter>({})
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCosmeticTypes, setSelectedCosmeticTypes] = useState<string[]>(
    []
  )
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<number[]>([0, 4000000])
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch cosmetics with pagination from the API
  const { data, isLoading, error } = useQuery({
    queryKey: [
      'cosmetics',
      currentPage,
      sortColumn,
      sortOrder,
      filters,
      searchQuery
    ],
    queryFn: async () => {
      const response = await cosmeticApi.getCosmetics(
        currentPage,
        ITEMS_PER_PAGE,
        sortColumn,
        sortOrder,
        searchQuery,
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

  const handleAddToOrder = (product: CosmeticResponse) => {
    setSelectedProducts((prevProducts) => {
      const existingProduct = prevProducts.find((p) => p.id === product.id)

      if (existingProduct) {
        // If product exists, increase quantity
        return prevProducts.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      } else {
        // If product doesn't exist, add it with quantity 1
        return [...prevProducts, { ...product, quantity: 1 }]
      }
    })
  }

  const handleDecreaseQuantity = (productId: string) => {
    setSelectedProducts(
      (prevProducts) =>
        prevProducts
          .map((p) =>
            p.id === productId ? { ...p, quantity: p.quantity - 1 } : p
          )
          .filter((p) => p.quantity > 0) // Remove if quantity is 0
    )
  }

  const handleRemoveFromOrder = (productId: string) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.filter((p) => p.id !== productId)
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb />
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#3A4D39]">All Products</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white shadow-lg transition-colors duration-300 hover:bg-green-800 disabled:opacity-50"
            onClick={handleOpenCustomerScreen}
          >
            Open Customer Screen
          </motion.button>
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
        <CosmeticProvider
          value={{
            filteredCosmetics: data?.items || [],
            isLoading,
            error: error as Error,
            totalPages: data?.totalPages || 1,
            currentPage,
            onPageChange: setCurrentPage,
            filters,
            setFilters: () => {}, // Add empty function since we're not using it
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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-8">
            <div className="lg:col-span-5">
              <CosmeticSearch onSearch={setSearchQuery} />
              <StaffProductGrid onAddToOrder={handleAddToOrder} />
            </div>
            <div className="lg:col-span-3">
              <OrderSummary
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
                onIncreaseQuantity={handleAddToOrder}
                onDecreaseQuantity={handleDecreaseQuantity}
                onRemoveProduct={handleRemoveFromOrder}
                coupon={coupon}
                setCoupon={setCoupon}
                setCustomerName={setCustomerName}
                setCustomerPhoneNumber={setPhoneNumber}
              />
            </div>
          </div>

          {customerViewOpen && (
            <CustomerScreen
              coupon={coupon}
              customerName={customerName}
              phoneNumber={customerPhoneNumber}
              selectedProducts={selectedProducts}
              onClose={handleCloseCustomerScreen}
            />
          )}
        </CosmeticProvider>
      </div>
    </div>
  )
}

export default ProductSelectionAndOrder
