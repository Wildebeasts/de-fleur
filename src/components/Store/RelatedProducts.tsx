import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface RelatedProduct {
  image: string
  name: string
  price: number
  id?: string
}

interface RelatedProductsProps {
  products: RelatedProduct[]
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ products }) => {
  const handleProductClick = (productId?: string) => {
    if (productId) {
      // Force a full page refresh by using window.location
      window.location.href = `/shopDetails?productId=${productId}`
    }
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
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      y: -8,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    }
  }

  const imageVariants = {
    hover: {
      scale: 1.08,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    }
  }

  return (
    <div className="mt-20">
      <h2 className="mb-8 text-2xl font-medium text-[#3A4D39]">
        Complete Your Routine
      </h2>

      <motion.div
        className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {products.map((product, index) => (
            <motion.div
              key={product.id || index}
              variants={itemVariants}
              whileHover="hover"
              layout
            >
              <Card className="overflow-hidden border-none bg-[#F9F5F0] shadow-md transition-all duration-300 hover:shadow-xl">
                <div className="relative">
                  <Badge className="absolute right-3 top-3 z-10 bg-[#3A4D39] px-3 py-1 text-xs font-medium text-white">
                    Recommended
                  </Badge>
                  <div className="absolute inset-0 z-10 bg-gradient-to-br from-[#F9F5F0]/50 to-transparent" />
                  <motion.div
                    className="aspect-square overflow-hidden"
                    variants={imageVariants}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="size-full object-cover"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-black/10"
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-full bg-white px-6 py-2 text-sm font-medium text-[#3A4D39] shadow-lg transition-all duration-300 hover:bg-[#3A4D39] hover:text-white"
                      onClick={() => handleProductClick(product.id)}
                    >
                      <Eye className="mr-2 size-4" />
                      Quick View
                    </Button>
                  </motion.div>
                </div>

                <CardContent className="p-5">
                  <h3 className="mb-2 font-inter text-lg font-medium text-[#3A4D39] transition-colors duration-300 hover:text-[#4A5D49]">
                    {product.name}
                  </h3>
                  <p className="font-inter text-lg font-semibold text-[#3A4D39]">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(product.price)}
                  </p>
                </CardContent>

                <CardFooter className="border-t border-[#3A4D39]/10 p-4">
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-[#3A4D39] text-[#3A4D39] transition-all duration-300 hover:bg-[#3A4D39] hover:text-white"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <ShoppingCart className="mr-2 size-4" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default RelatedProducts
