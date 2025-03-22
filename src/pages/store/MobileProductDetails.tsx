/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ShoppingBag,
  Share2,
  Plus,
  Minus,
  Star,
  Info,
  ChevronRight,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import cartApi from '@/lib/services/cartApi'

interface MobileProductDetailsProps {
  product: any
  relatedProducts: any[]
}

const MobileProductDetails: React.FC<MobileProductDetailsProps> = ({
  product,
  relatedProducts
}) => {
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('details')
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  // Format currency function
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  const handleBack = () => {
    navigate({ to: '/shop' })
  }

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true)
      const response = await cartApi.addToCart(product.id, quantity)

      if (response.data.isSuccess) {
        toast.success(`${product.name} added to cart!`)
        // Dispatch custom event to notify cart count should be updated
        window.dispatchEvent(new Event('cart-updated'))
      } else {
        console.error('Failed to add item to cart:', response.data.message)
        toast.error(response.data.message || 'Failed to add item to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Unable to add to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleShare = () => {
    // Simple share functionality
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Check out this amazing skincare product: ${product.name}`,
          url: window.location.href
        })
        .then(() => console.log('Shared successfully'))
        .catch((error) => console.log('Error sharing:', error))
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => toast.success('Product link copied to clipboard!'))
        .catch(() => toast.error('Failed to copy link'))
    }
  }

  // Get product images
  const productImages =
    product.cosmeticImages && product.cosmeticImages.length > 0
      ? product.cosmeticImages.map((img: any) => img.imageUrl)
      : [
          product.thumbnailUrl ||
            'https://placehold.co/400x400/E8F3D6/3A4D39?text=Product'
        ]

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 pb-24">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white/90 px-4 py-3 backdrop-blur-md">
        <button
          onClick={handleBack}
          className="rounded-full p-2 active:bg-gray-100"
        >
          <ChevronLeft className="size-5 text-[#3A4D39]" />
        </button>
        <h1 className="mx-auto line-clamp-1 max-w-[200px] text-lg font-medium text-[#3A4D39]">
          {product.name}
        </h1>
        <button
          onClick={handleShare}
          className="rounded-full p-2 active:bg-gray-100"
        >
          <Share2 className="size-5 text-[#3A4D39]" />
        </button>
      </header>

      {/* Product image carousel */}
      <div className="relative bg-white">
        <div className="aspect-square w-full overflow-hidden">
          <img
            src={productImages[activeImageIndex]}
            alt={product.name}
            className="size-full object-cover"
          />
        </div>

        {/* Image navigation dots */}
        {productImages.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1">
            {productImages.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`size-2 rounded-full ${
                  index === activeImageIndex
                    ? 'bg-[#3A4D39]'
                    : 'bg-[#3A4D39]/30'
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Basic product info */}
      <div className="bg-white p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-medium text-[#3A4D39]">
              {product.name}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${
                      i < Math.floor(product.rating || 4)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                ({product.feedbacks?.length || 0} reviews)
              </span>
            </div>
          </div>
          <div className="text-xl font-semibold text-[#3A4D39]">
            {formatCurrency(product.price)}
          </div>
        </div>

        {/* Tags/badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          {product.cosmeticSubCategories?.map((subCat: any, index: number) => (
            <Badge
              key={index}
              className="bg-[#E8F3D6] text-[#3A4D39] hover:bg-[#E8F3D6]/80"
            >
              {subCat.subCategory.name}
            </Badge>
          ))}
          {product.cosmeticTypeId && (
            <Badge className="bg-[#A7C4BC]/30 text-[#3A4D39] hover:bg-[#A7C4BC]/50">
              {product.cosmeticType?.name || 'Skincare'}
            </Badge>
          )}
        </div>
      </div>

      {/* Quantity selector and add to cart */}
      <div className="mt-2 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-[#3A4D39]">Quantity</div>
          <div className="flex items-center">
            <button
              onClick={decrementQuantity}
              className="flex size-8 items-center justify-center rounded-full border border-gray-200 active:bg-gray-100"
              disabled={quantity <= 1}
            >
              <Minus className="size-4 text-[#3A4D39]" />
            </button>
            <span className="mx-3 min-w-8 text-center">{quantity}</span>
            <button
              onClick={incrementQuantity}
              className="flex size-8 items-center justify-center rounded-full border border-gray-200 active:bg-gray-100"
            >
              <Plus className="size-4 text-[#3A4D39]" />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <Button
            className="w-full bg-[#3A4D39] hover:bg-[#4A5D49]"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <ShoppingBag className="mr-2 size-4" />
            )}
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Detailed information tabs */}
      <Tabs
        defaultValue="details"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-2"
      >
        <TabsList className="grid w-full grid-cols-3 bg-white">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Details tab */}
            <TabsContent value="details" className="bg-white p-4">
              <h3 className="font-medium text-[#3A4D39]">
                Product Description
              </h3>
              <p className="mt-2 text-sm text-[#3A4D39]/80">
                {product.description || 'No description available'}
              </p>

              <h3 className="mt-4 font-medium text-[#3A4D39]">How to Use</h3>
              <p className="mt-2 text-sm text-[#3A4D39]/80">
                {product.instructions ||
                  'Apply to cleansed skin daily or as needed.'}
              </p>

              <div className="mt-4 rounded-lg bg-[#E8F3D6]/40 p-3">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-4 text-[#3A4D39]" />
                  <div>
                    <h4 className="font-medium text-[#3A4D39]">Best for:</h4>
                    <p className="text-sm text-[#3A4D39]/80">
                      {product.mainUsage || 'All skin types'}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Ingredients tab */}
            <TabsContent value="ingredients" className="bg-white p-4">
              <h3 className="font-medium text-[#3A4D39]">Ingredients</h3>
              <p className="mt-2 whitespace-pre-line text-sm text-[#3A4D39]/80">
                {product.ingredients || 'Ingredient information not available'}
              </p>
            </TabsContent>

            {/* Reviews tab */}
            <TabsContent value="reviews" className="bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-[#3A4D39]">Customer Reviews</h3>
                <span className="text-sm text-[#3A4D39]/80">
                  {product.feedbacks?.length || 0} reviews
                </span>
              </div>

              {product.feedbacks && product.feedbacks.length > 0 ? (
                <div className="mt-3 space-y-4">
                  {product.feedbacks
                    .slice(0, 3)
                    .map((review: any, index: number) => (
                      <div
                        key={index}
                        className="border-b border-gray-100 pb-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {review.customer?.userName || 'User'}
                          </span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`size-3 ${
                                  i < review.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-gray-200 text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-[#3A4D39]/80">
                          {review.content || 'Great product!'}
                        </p>
                      </div>
                    ))}

                  {product.feedbacks.length > 3 && (
                    <button className="flex w-full items-center justify-center gap-1 rounded-md bg-gray-50 p-2 text-sm text-[#3A4D39]">
                      View all reviews <ChevronRight className="size-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-4 rounded-lg bg-gray-50 p-4 text-center text-sm text-[#3A4D39]/80">
                  No reviews yet.
                </div>
              )}
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Related products section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-2 bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[#3A4D39]">
              Complete Your Routine
            </h3>
            <button
              onClick={() => navigate({ to: '/shop' })}
              className="flex items-center text-sm text-[#3A4D39]"
            >
              View All <ArrowRight className="ml-1 size-4" />
            </button>
          </div>

          <div className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto pb-2">
            {relatedProducts.map((relProduct, index) => (
              <div
                key={index}
                className="shrink-0 cursor-pointer snap-start rounded-lg bg-[#F9F5F0] shadow-sm"
                style={{ width: '150px' }}
                onClick={() =>
                  navigate({
                    to: '/shopDetails',
                    search: { productId: relProduct.id },
                    replace: true
                  })
                }
              >
                <div className="aspect-square w-full overflow-hidden rounded-t-lg">
                  <img
                    src={
                      relProduct.thumbnailUrl ||
                      relProduct.cosmeticImages?.[0]?.imageUrl ||
                      'https://placehold.co/400x400/E8F3D6/3A4D39?text=Product'
                    }
                    alt={relProduct.name}
                    className="size-full object-cover"
                  />
                </div>
                <div className="p-2">
                  <p className="line-clamp-1 font-medium text-[#3A4D39]">
                    {relProduct.name}
                  </p>
                  <p className="mt-1 text-sm text-[#3A4D39]/80">
                    {formatCurrency(relProduct.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileProductDetails
