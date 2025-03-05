import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Star, ShoppingCart } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import cosmeticApi from '@/lib/services/cosmeticApi'
import { Loader2 } from 'lucide-react'

interface QuickViewModalProps {
  productId: string | null
  isOpen: boolean
  onClose: () => void
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({
  productId,
  isOpen,
  onClose
}) => {
  // Fetch product details when productId is available
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null
      const response = await cosmeticApi.getCosmeticById(productId)
      if (response.data.isSuccess) {
        return response.data.data
      }
      throw new Error('Failed to fetch product')
    },
    enabled: !!productId && isOpen
  })

  const handleViewDetails = () => {
    if (productId) {
      window.location.href = `/shopDetails?productId=${productId}`
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <DialogContent className="sm:max-w-[600px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-[#3A4D39]">
                  Quick View
                </DialogTitle>
                <DialogDescription className="text-[#3A4D39]/70">
                  Product details
                </DialogDescription>
              </DialogHeader>

              {isLoading ? (
                <div className="flex h-64 w-full items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-[#3A4D39]" />
                </div>
              ) : product ? (
                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <motion.div
                    className="relative overflow-hidden rounded-lg bg-[#F9F5F0]"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F9F5F0]/50 to-transparent" />
                    <img
                      src={product.thumbnailUrl || ''}
                      alt={product.name}
                      className="aspect-square w-full object-cover"
                    />
                  </motion.div>

                  <motion.div
                    className="flex flex-col justify-between"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-[#3A4D39]">
                        {product.name}
                      </h3>

                      <div className="mt-2 flex items-center">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={`${
                                star <= 4
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          4.0 (Reviews)
                        </span>
                      </div>

                      <p className="mt-4 text-lg font-medium text-[#3A4D39]">
                        ${product.price.toFixed(2)}
                      </p>

                      <div className="mt-4">
                        <h4 className="font-medium text-[#3A4D39]">
                          Description:
                        </h4>
                        <p className="mt-1 text-sm text-gray-600">
                          {product.mainUsage || 'No description available'}
                        </p>
                      </div>

                      {product.ingredients && (
                        <div className="mt-4">
                          <h4 className="font-medium text-[#3A4D39]">
                            Key Ingredients:
                          </h4>
                          <p className="mt-1 text-sm text-gray-600">
                            {product.ingredients
                              .split(',')
                              .slice(0, 3)
                              .join(', ')}
                          </p>
                        </div>
                      )}
                    </div>

                    <DialogFooter className="mt-6 flex gap-3">
                      <Button
                        className="flex-1 bg-rose-300 text-black hover:bg-rose-400"
                        onClick={handleViewDetails}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-[#3A4D39] text-[#3A4D39] hover:bg-[#3A4D39] hover:text-white"
                      >
                        <ShoppingCart className="mr-2 size-4" />
                        Add to Cart
                      </Button>
                    </DialogFooter>
                  </motion.div>
                </div>
              ) : (
                <div className="flex h-64 w-full items-center justify-center">
                  <p className="text-gray-500">Product not found</p>
                </div>
              )}
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  )
}

export default QuickViewModal
