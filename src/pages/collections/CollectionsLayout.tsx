/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Star, Users, Clock, Eye, ShoppingCart } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import cosmeticApi from '@/lib/services/cosmeticApi'
import cosmeticTypeApi from '@/lib/services/cosmeticTypeApi'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import QuickViewModal from './QuickViewModal'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CosmeticResponse } from '@/lib/types/Cosmetic'

interface Collection {
  id: string
  title: string
  description: string
  image: string
  productCount: number
  rating: number
  reviewCount: number
  featured: boolean
  bestSellers: {
    id: string
    name: string
    image: string
    price: string
  }[]
  tags: string[]
  launchDate: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const CollectionsLayout: React.FC = () => {
  const navigate = useNavigate()
  const [collections, setCollections] = useState<Collection[]>([])
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(
    null
  )
  const [cosmeticsByType, setCosmeticsByType] = useState<
    Record<string, CosmeticResponse[]>
  >({})

  // Fetch all cosmetics
  const { data: cosmetics, isLoading: isLoadingCosmetics } = useQuery({
    queryKey: ['allCosmetics'],
    queryFn: async () => {
      const response = await cosmeticApi.getCosmetics()
      if (response.data.isSuccess) {
        return response.data.data
      }
      throw new Error('Failed to fetch cosmetics')
    }
  })

  // Fetch all cosmetic types
  const { data: cosmeticTypes, isLoading: isLoadingTypes } = useQuery({
    queryKey: ['cosmeticTypes'],
    queryFn: async () => {
      const response = await cosmeticTypeApi.getCosmeticTypes()
      if (response.data.isSuccess) {
        return response.data.data
      }
      throw new Error('Failed to fetch cosmetic types')
    }
  })

  // Process cosmetics into collections when data is available
  useEffect(() => {
    if (cosmetics && cosmeticTypes) {
      const processedCollections: Collection[] = []

      // Group cosmetics by cosmetic type
      const cosmeticsByTypeObj = cosmetics.items.reduce(
        (acc, cosmetic) => {
          if (!acc[cosmetic.cosmeticTypeId]) {
            acc[cosmetic.cosmeticTypeId] = []
          }
          acc[cosmetic.cosmeticTypeId].push(cosmetic)
          return acc
        },
        {} as Record<string, CosmeticResponse[]>
      )

      // Save to state so it's available in render
      setCosmeticsByType(cosmeticsByTypeObj)

      // Create collections from the grouped cosmetics
      Object.entries(cosmeticsByTypeObj).forEach(
        ([typeId, typeCosmetics], index) => {
          // Find the cosmetic type name
          const cosmeticType = cosmeticTypes.find((type) => type.id === typeId)
          if (!cosmeticType || typeCosmetics.length === 0) return

          // Calculate average rating
          const ratings = typeCosmetics
            .flatMap((c) =>
              c.feedbacks
                ? c.feedbacks.map((f) => {
                  // Ensure f is an object with a rating property
                  if (f && typeof f === 'object' && 'rating' in f) {
                    return (f as { rating: number }).rating
                  }
                  return 0
                })
                : []
            )
            .filter((r) => r > 0)

          const avgRating =
            ratings.length > 0
              ? ratings.reduce((sum, rating) => sum + rating, 0) /
              ratings.length
              : 4.5 // Default rating if none available

          // Get total review count
          const reviewCount = ratings.length

          // Get bestsellers (top 2 by price)
          const sortedByPrice = [...typeCosmetics].sort(
            (a, b) => b.price - a.price
          )
          const bestSellers = sortedByPrice.slice(0, 2).map((c) => ({
            id: c.id,
            name: c.name || 'Unnamed Product',
            price: `$${c.price.toFixed(2)}`,
            image: getImageUrl(c.cosmeticImages?.[0])
          }))

          // Extract tags from ingredients (first 3 words)
          const allIngredients = typeCosmetics
            .map((c) => c.ingredients)
            .filter(Boolean)
            .join(', ')
            .split(',')
            .map((i) => i.trim())
            .filter((i) => i.length > 3)

          const tags = [...new Set(allIngredients)].slice(0, 3).filter(Boolean)

          // Create the collection
          processedCollections.push({
            id: typeId,
            title: cosmeticType.name || `Collection ${index + 1}`,
            description:
              cosmeticType.description ||
              typeCosmetics[0]?.mainUsage ||
              'A curated collection of premium skincare products',
            image: getImageUrl(typeCosmetics[0]?.cosmeticImages?.[0]),
            productCount: typeCosmetics.length,
            rating: parseFloat(avgRating.toFixed(1)),
            reviewCount,
            featured: index === 0, // Make the first collection featured
            bestSellers,
            tags: tags.length > 0 ? tags : ['Premium', 'Skincare', 'Natural'],
            launchDate: index === 0 ? 'New Collection' : ''
          })
        }
      )

      setCollections(processedCollections)
    }
  }, [cosmetics, cosmeticTypes])
  // Helper function to get image URL from cosmetic image
  const getImageUrl = (
    image: { imageUrl?: string } | string | null | undefined
  ): string => {
    if (!image)
      return 'https://cdn.builder.io/api/v1/image/assets/TEMP/7e1fed01c40f1a7f044a66aca0e153a5ed752c1bd54841cda7ad5862bd0ad430'

    if (typeof image === 'object' && image !== null) {
      return (
        image.imageUrl ||
        'https://cdn.builder.io/api/v1/image/assets/TEMP/7e1fed01c40f1a7f044a66aca0e153a5ed752c1bd54841cda7ad5862bd0ad430'
      )
    }

    if (typeof image === 'string') {
      return image
    }

    return 'https://cdn.builder.io/api/v1/image/assets/TEMP/7e1fed01c40f1a7f044a66aca0e153a5ed752c1bd54841cda7ad5862bd0ad430'
  }

  const handleViewCollection = (typeId: string) => {
    navigate({
      to: '/shop',
      search: {
        cosmeticTypeId: typeId
      }
    })
  }

  const handleQuickView = (productId: string) => {
    setQuickViewProductId(productId)
  }

  const closeQuickView = () => {
    setQuickViewProductId(null)
  }

  if (isLoadingCosmetics || isLoadingTypes) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#3A4D39]" />
        <span className="ml-2 text-lg text-[#3A4D39]">
          Loading collections...
        </span>
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-orange-50/80 to-white px-20 py-16 max-md:px-5"
    >
      <motion.div
        variants={itemVariants}
        className="mx-auto max-w-7xl space-y-12"
      >
        <div className="text-center">
          <span className="mb-4 inline-block rounded-full bg-rose-100 px-4 py-2 text-sm text-rose-500">
            Discover Our Collections
          </span>
          <h1 className="text-6xl font-semibold text-[#3A4D39]">
            Curated Skincare Sets
          </h1>
          <p className="mt-4 text-xl text-[#3A4D39]/80">
            Each collection is thoughtfully crafted to address specific skin
            concerns
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2">
          {collections.map((collection) => (
            <motion.div
              key={collection.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg"
            >
              {collection.featured && (
                <div className="absolute right-4 top-4 z-10 rounded-full bg-rose-500 px-4 py-1 text-sm text-white">
                  Featured Collection
                </div>
              )}

              <div className="relative">
                <div className="aspect-[16/9] overflow-hidden">
                  <motion.img
                    src={collection.image}
                    alt={collection.title}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
              </div>

              <div className="p-8">
                <div className="flex flex-wrap items-center gap-4">
                  <h2 className="text-2xl font-semibold text-[#3A4D39]">
                    {collection.title}
                  </h2>
                  <Badge className="bg-[#D1E2C4] text-[#3A4D39] hover:bg-[#D1E2C4]/80">
                    {collection.productCount} Products
                  </Badge>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {collection.rating}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="size-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {collection.reviewCount} reviews
                    </span>
                  </div>
                  {collection.launchDate && (
                    <div className="flex items-center gap-1">
                      <Clock className="size-4 text-rose-400" />
                      <span className="text-sm text-rose-400">
                        {collection.launchDate}
                      </span>
                    </div>
                  )}
                </div>

                <p className="mt-4 text-[#3A4D39]/80">
                  {collection.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {collection.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-8">
                  <Tabs defaultValue="bestsellers" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="bestsellers">Bestsellers</TabsTrigger>
                      <TabsTrigger value="all">All Products</TabsTrigger>
                    </TabsList>
                    <TabsContent value="bestsellers">
                      <div className="flex gap-4">
                        {collection.bestSellers.map((product, idx) => (
                          <div
                            key={idx}
                            className="w-24 cursor-pointer"
                            onClick={() => handleQuickView(product.id)}
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="aspect-square rounded-lg object-cover"
                            />
                            <p className="mt-2 text-xs text-gray-600">
                              {product.name}
                            </p>
                            <p className="text-xs font-medium text-[#3A4D39]">
                              {product.price}
                            </p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="all">
                      <div className="grid max-h-60 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
                        {cosmeticsByType[collection.id]?.map((product, idx) => (
                          <Card
                            key={idx}
                            className="cursor-pointer overflow-hidden border-none shadow-sm hover:shadow-md"
                            onClick={() => handleQuickView(product.id)}
                          >
                            <div className="aspect-square overflow-hidden">
                              <img
                                src={getImageUrl(product.cosmeticImages?.[0])}
                                alt={product.name || 'Product'}
                                className="size-full object-cover transition-transform duration-300 hover:scale-105"
                              />
                            </div>
                            <CardContent className="p-3">
                              <p className="truncate text-xs font-medium text-[#3A4D39]">
                                {product.name || 'Unnamed Product'}
                              </p>
                              <p className="text-xs font-semibold text-[#3A4D39]">
                                ${product.price.toFixed(2)}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <Button
                    className="flex-1 bg-rose-300 text-black hover:bg-rose-400"
                    onClick={() => handleViewCollection(collection.id)}
                  >
                    <ShoppingCart className="mr-2 size-4" />
                    View Collection
                  </Button>
                  <Button
                    variant="outline"
                    className="border-rose-200 hover:bg-rose-50"
                    onClick={() =>
                      collection.bestSellers[0] &&
                      handleQuickView(collection.bestSellers[0].id)
                    }
                  >
                    <Eye className="mr-2 size-4" />
                    Quick View
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <QuickViewModal
        productId={quickViewProductId}
        isOpen={!!quickViewProductId}
        onClose={closeQuickView}
      />
    </motion.div>
  )
}

export default CollectionsLayout
