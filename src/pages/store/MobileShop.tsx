/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import cosmeticApi from '@/lib/services/cosmeticApi'
import {
  Loader2,
  Search,
  ChevronRight,
  ShoppingBag,
  Droplets,
  Paintbrush,
  Sun,
  Leaf,
  Eye,
  Heart,
  FlaskConical,
  Droplet,
  PlusCircle,
  Flower
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import cartApi from '@/lib/services/cartApi'
import cosmeticTypeApi from '@/lib/services/cosmeticTypeApi'

const MobileShop: React.FC = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isAddingToCart, setIsAddingToCart] = useState<Record<string, boolean>>(
    {}
  )

  // Format currency function
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  // Fetch all product categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['cosmetic-categories'],
    queryFn: async () => {
      try {
        const response = await cosmeticTypeApi.getCosmeticTypes()
        console.log('Categories API response:', response)

        if (response.data.isSuccess && response.data.data) {
          return response.data.data
        }
        console.warn('No categories found in API response')
        return []
      } catch (error) {
        console.error('Error fetching categories:', error)
        return []
      }
    }
  })

  // Fetch featured products (best sellers)
  const { data: featuredProducts, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const response = await cosmeticApi.getCosmetics(1, 1000)
      if (response.data.isSuccess && response.data.data) {
        // Get the items array from the paginated response
        const items = response.data.data.items || []
        // Return the first 4 items for featured products
        return items.slice(0, 4)
      }
      return []
    }
  })

  // Fetch products for active category
  const { data: categoryProducts, isLoading: categoryProductsLoading } =
    useQuery({
      queryKey: ['category-products', activeCategory],
      queryFn: async () => {
        const response = await cosmeticApi.getCosmetics(1, 1000)
        if (response.data.isSuccess && response.data.data) {
          let items = response.data.data.items || []
          if (activeCategory) {
            items = items.filter(
              (item) => item.cosmeticTypeId === activeCategory
            )
          }
          return items
        }
        return []
      },
      enabled: !!activeCategory
    })

  // Fetch all products (when search is active)
  const {
    data: searchResults,
    isLoading: searchLoading,
    refetch: searchRefetch
  } = useQuery({
    queryKey: ['search-products', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return []

      const response = await cosmeticApi.getCosmetics(1, 1000)
      if (response.data.isSuccess && response.data.data) {
        const items = response.data.data.items || []
        return items.filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.mainUsage &&
              item.mainUsage.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      }
      return []
    },
    enabled: !!searchQuery
  })

  // Fetch all products for category backgrounds
  const { data: allProducts } = useQuery({
    queryKey: ['all-products-for-categories'],
    queryFn: async () => {
      const response = await cosmeticApi.getCosmetics(1, 1000)
      if (response.data.isSuccess && response.data.data) {
        return response.data.data.items || []
      }
      return []
    }
  })

  // Handle add to cart
  const handleAddToCart = async (productId: string) => {
    try {
      setIsAddingToCart((prev) => ({ ...prev, [productId]: true }))

      const response = await cartApi.addToCart(productId, 1)

      if (response.data.isSuccess) {
        toast.success('Added to cart!')
      } else {
        toast.error(response.data.message || 'Failed to add item to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Unable to add to cart')
    } finally {
      setIsAddingToCart((prev) => ({ ...prev, [productId]: false }))
    }
  }

  // Navigation to product details
  const navigateToProduct = (productId: string) => {
    navigate({ to: '/shopDetails', search: { productId } })
  }

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchRefetch()
    }
  }

  // Handle category selection
  const selectCategory = (categoryId: string) => {
    setActiveCategory(categoryId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Back to categories view
  const backToCategories = () => {
    setActiveCategory(null)
    setSearchQuery('')
  }

  // Add this helper function to get products by category
  const getProductsByCategory = (products: any[], categoryId: string) => {
    return products.filter((product) => product.cosmeticTypeId === categoryId)
  }

  // This function needs to be added to your component
  const getCategoryImage = (category: any, allProducts: any[]) => {
    // Get products for this category
    const categoryProducts = getProductsByCategory(allProducts, category.id)

    // Find a product with an image
    const productWithImage = categoryProducts.find((p) => {
      return (
        p.thumbnailUrl ||
        (p.cosmeticImages &&
          p.cosmeticImages.length > 0 &&
          p.cosmeticImages[0].imageUrl)
      )
    })

    // Get the image URL from the first product that has one
    if (productWithImage) {
      if (productWithImage.thumbnailUrl) {
        return productWithImage.thumbnailUrl
      } else if (
        productWithImage.cosmeticImages &&
        productWithImage.cosmeticImages.length > 0
      ) {
        return productWithImage.cosmeticImages[0].imageUrl
      }
    }

    // Fallback color backgrounds if no product images are available
    return null
  }

  // Update this function for better icon selection
  const getCategoryStyle = (categoryName: string) => {
    const name = categoryName.toLowerCase()

    if (name.includes('cleanser')) {
      return {
        bgClass: 'bg-blue-100',
        icon: <Droplets className="size-5 text-blue-600" />,
        accentColor: 'bg-blue-200/60'
      }
    }
    if (name.includes('exfoliat')) {
      return {
        bgClass: 'bg-amber-100',
        icon: <Paintbrush className="size-5 text-orange-600" />,
        accentColor: 'bg-orange-200/60'
      }
    }
    if (name.includes('sunscreen') || name.includes('sun')) {
      return {
        bgClass: 'bg-yellow-100',
        icon: <Sun className="size-5 text-amber-600" />,
        accentColor: 'bg-amber-200/60'
      }
    }
    if (name.includes('moisturizer')) {
      return {
        bgClass: 'bg-green-100',
        icon: <Droplet className="size-5 text-emerald-600" />,
        accentColor: 'bg-emerald-200/60'
      }
    }
    if (name.includes('serum')) {
      return {
        bgClass: 'bg-violet-100',
        icon: <FlaskConical className="size-5 text-purple-600" />,
        accentColor: 'bg-purple-200/60'
      }
    }
    if (name.includes('mask')) {
      return {
        bgClass: 'bg-pink-100',
        icon: <Flower className="size-5 text-rose-600" />,
        accentColor: 'bg-rose-200/60'
      }
    }
    if (name.includes('eye')) {
      return {
        bgClass: 'bg-indigo-100',
        icon: <Eye className="size-5 text-indigo-600" />,
        accentColor: 'bg-indigo-200/60'
      }
    }
    if (name.includes('toner')) {
      return {
        bgClass: 'bg-sky-100',
        icon: <Leaf className="size-5 text-sky-600" />,
        accentColor: 'bg-sky-200/60'
      }
    }
    if (name.includes('lip')) {
      return {
        bgClass: 'bg-red-100',
        icon: <Heart className="size-5 text-red-600" />,
        accentColor: 'bg-red-200/60'
      }
    }

    // Default style
    return {
      bgClass: 'bg-[#E8F3D6]',
      icon: <ShoppingBag className="size-5 text-[#3A4D39]" />,
      accentColor: 'bg-[#3A4D39]/20'
    }
  }

  // Render product card (reusable)
  const renderProductCard = (product: any) => (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden rounded-lg bg-white shadow-sm"
      onClick={() => navigateToProduct(product.id)}
    >
      {/* Product image */}
      <div className="relative aspect-square w-full">
        <img
          src={
            product.thumbnailUrl ||
            product.cosmeticImages?.[0]?.imageUrl ||
            'https://placehold.co/400x400/E8F3D6/3A4D39?text=Product'
          }
          alt={product.name}
          className="size-full object-cover"
        />

        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute left-1 top-1 rounded bg-rose-500 px-1.5 py-0.5 text-xs font-medium text-white">
            Sale
          </div>
        )}

        <button
          className="absolute right-1 top-1 rounded-full bg-white/80 p-1.5 shadow-sm"
          onClick={(e) => {
            e.stopPropagation()
            handleAddToCart(product.id)
          }}
        >
          {isAddingToCart[product.id] ? (
            <Loader2 className="size-4 animate-spin text-[#3A4D39]" />
          ) : (
            <PlusCircle className="size-4 text-[#3A4D39]" />
          )}
        </button>
      </div>

      {/* Product info */}
      <div className="p-3">
        <h3 className="line-clamp-1 font-medium text-[#3A4D39]">
          {product.name}
        </h3>

        <div className="mt-1 flex items-center justify-between">
          <p className="font-semibold text-[#3A4D39]">
            {formatCurrency(product.price)}
          </p>

          {product.originalPrice && product.originalPrice > product.price && (
            <p className="text-xs text-gray-400 line-through">
              {formatCurrency(product.originalPrice)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )

  console.log('Categories in render:', categories)

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-24">
      {/* Shop header with search */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex flex-col p-4">
          <div className="flex items-center justify-between">
            {activeCategory ? (
              <button
                className="flex items-center text-[#3A4D39]"
                onClick={backToCategories}
              >
                <ChevronRight className="mr-1 size-4 rotate-180" />
                <h1 className="text-xl font-bold">
                  {categories?.find((c) => c.id === activeCategory)?.name ||
                    'Category'}
                </h1>
              </button>
            ) : (
              <h1 className="text-2xl font-bold text-[#3A4D39]">Shop</h1>
            )}

            <button
              onClick={() => navigate({ to: '/cart' })}
              className="rounded-full p-1.5 active:bg-gray-100"
            >
              <ShoppingBag className="size-5 text-[#3A4D39]" />
            </button>
          </div>

          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search products..."
              className="px-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100"
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        {/* Search Results */}
        {searchQuery && (
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-[#3A4D39]">
                Search Results
              </h2>
              <span className="text-sm text-gray-500">
                {searchResults?.length || 0} products
              </span>
            </div>

            {searchLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="size-8 animate-spin text-[#3A4D39]" />
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {searchResults.map((product) => renderProductCard(product))}
              </div>
            ) : (
              <div className="rounded-lg bg-white p-6 text-center">
                <p className="text-sm text-gray-500">
                  No products found matching &quot;{searchQuery}&quot;
                </p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        )}

        {!searchQuery && !activeCategory && (
          <>
            {/* Featured Products Section */}
            <section className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-[#3A4D39]">
                  Featured Products
                </h2>
                <button
                  className="flex items-center text-sm text-[#3A4D39]"
                  onClick={() => navigate({ to: '/shop' })}
                >
                  View All <ChevronRight className="size-4" />
                </button>
              </div>

              {featuredLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="size-6 animate-spin text-[#3A4D39]" />
                </div>
              ) : featuredProducts && featuredProducts.length > 0 ? (
                <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto pb-2">
                  {featuredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="w-[160px] shrink-0 snap-start"
                      onClick={() => navigateToProduct(product.id)}
                    >
                      {renderProductCard(product)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-white p-4 text-center text-sm text-gray-500">
                  No featured products available
                </div>
              )}
            </section>

            {/* Categories Section */}
            <section className="mb-6">
              <h2 className="mb-4 text-lg font-medium text-[#3A4D39]">
                Shop by Category
              </h2>

              {categoriesLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="size-6 animate-spin text-[#3A4D39]" />
                </div>
              ) : categories && categories.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => {
                    const style = getCategoryStyle(category.name)
                    const productImage = getCategoryImage(
                      category,
                      allProducts || []
                    )

                    return (
                      <motion.div
                        key={category.id}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        className="overflow-hidden rounded-xl shadow-lg"
                        onClick={() => selectCategory(category.id)}
                      >
                        <div
                          className={`relative aspect-[4/3] w-full ${!productImage ? style.bgClass : ''}`}
                          style={
                            productImage
                              ? {
                                  backgroundImage: `url(${productImage})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center'
                                }
                              : {}
                          }
                        >
                          {/* Glass morphism effect container */}
                          <div className="absolute inset-0">
                            {/* Dark gradient for readability with heavy bottom fade */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                            {/* Colored overlay with blend mode */}
                            <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/30" />
                            <div
                              className={`absolute inset-0 opacity-40 mix-blend-overlay ${style.bgClass}`}
                            />
                          </div>

                          {/* Icon with enhanced treatment */}
                          <div className="absolute left-3.5 top-3.5 flex items-center justify-center rounded-full bg-white/90 p-2.5 shadow-md backdrop-blur-xl">
                            {style.icon}
                          </div>

                          {/* Content container with improved layout */}
                          <div className="absolute bottom-0 w-full p-3.5">
                            <div className="flex items-end justify-between">
                              <h3 className="text-xl font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                {category.name}
                              </h3>
                              <div className="rounded-full bg-white/90 p-2 shadow-md backdrop-blur-md">
                                <ChevronRight className="size-4 text-gray-700" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-lg bg-white p-4 text-center text-sm text-gray-500">
                  No categories available
                </div>
              )}
            </section>
          </>
        )}

        {/* Category Products */}
        {!searchQuery && activeCategory && (
          <div className="mt-2">
            {categoryProductsLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="size-8 animate-spin text-[#3A4D39]" />
              </div>
            ) : categoryProducts && categoryProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {categoryProducts.map((product) => renderProductCard(product))}
              </div>
            ) : (
              <div className="rounded-lg bg-white p-6 text-center">
                <p className="text-sm text-gray-500">
                  No products found in this category
                </p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={backToCategories}
                >
                  Back to Categories
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating action button for cart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="fixed bottom-20 right-4 z-10"
      >
        <Button
          size="lg"
          className="size-12 rounded-full bg-[#3A4D39] p-0 shadow-lg"
          onClick={() => navigate({ to: '/cart' })}
        >
          <ShoppingBag className="size-5 text-white" />
        </Button>
      </motion.div>
    </div>
  )
}

export default MobileShop
