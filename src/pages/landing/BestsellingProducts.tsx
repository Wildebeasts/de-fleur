/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { motion } from 'framer-motion'
import ProductCard from '@/components/Store/ProductCard'
import { useQuery } from '@tanstack/react-query'
import cosmeticApi from '@/lib/services/cosmeticApi'
import { Loader2 } from 'lucide-react'
import { CosmeticResponse } from '@/lib/types/Cosmetic'

// Fallback products in case API fails
const fallbackProducts = [
  {
    id: 'product-1',
    name: 'Renewal Night Cream',
    mainUsage: 'Rich moisturizing cream with natural extracts',
    price: 89.0,
    thumbnailUrl:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/7e1fed01c40f1a7f044a66aca0e153a5ed752c1bd54841cda7ad5862bd0ad430?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    brand: { name: 'De Fleur' },
    isActive: true,
    gender: true,
    cosmeticImages: []
  },
  {
    id: 'product-2',
    name: 'Vitamin C Serum',
    mainUsage: 'Brightening formula with 20% Vitamin C',
    price: 75.0,
    thumbnailUrl:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/93175b3ef23a838d07b312a11cd9409acb23f04c6b28613e52e00a8bcb72709c?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    brand: { name: 'De Fleur' },
    isActive: true,
    gender: true,
    cosmeticImages: []
  },
  {
    id: 'product-3',
    name: 'Radiance Face Oil',
    mainUsage: 'Nourishing blend of natural oils',
    price: 65.0,
    thumbnailUrl:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/502832db11429b604680472638a3f8621487ea96a153661274824baa1ee0acf5?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    brand: { name: 'De Fleur' },
    isActive: true,
    gender: true,
    cosmeticImages: []
  },
  {
    id: 'product-4',
    name: 'Purifying Clay Mask',
    mainUsage: 'Deep cleansing mask with kaolin clay',
    price: 55.0,
    thumbnailUrl:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/d3749484c9f854c8c506194af4551de113a3c9b1770f391bf91f5e0feaf6d14d?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    brand: { name: 'De Fleur' },
    isActive: true,
    gender: true,
    cosmeticImages: []
  }
] as unknown as CosmeticResponse[]

const BestsellingProducts: React.FC = () => {
  const {
    data: products,
    isLoading,
    error
  } = useQuery({
    queryKey: ['bestselling-products'],
    queryFn: async () => {
      const response = await cosmeticApi.getCosmetics()
      if (response.data.isSuccess && response.data.data) {
        // Get the items array from the paginated response
        const items = response.data.data.items || []

        // Sort by sales or another metric if available
        // For now, just return the first 4 items
        return items.slice(0, 4)
      }
      return []
    }
  })

  // Animation variants
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

  if (isLoading) {
    return (
      <section className="bg-[#F9F6F0] py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-inter text-3xl font-bold text-[#3A4D39] md:text-4xl">
              Best Selling Products
            </h2>
            <p className="mx-auto max-w-2xl text-[#3A4D39]/70">
              Discover our most popular skincare solutions loved by customers
            </p>
          </div>
          <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="size-8 animate-spin text-[#3A4D39]" />
            <span className="ml-2 text-lg text-[#3A4D39]">
              Loading products...
            </span>
          </div>
        </div>
      </section>
    )
  }

  if (error || !products || products.length === 0) {
    console.error('Error loading bestselling products:', error)
    // Return a simplified version with placeholder data instead of showing an error
    return (
      <section className="bg-[#F9F6F0] py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-inter text-3xl font-bold text-[#3A4D39] md:text-4xl">
              Best Selling Products
            </h2>
            <p className="mx-auto max-w-2xl text-[#3A4D39]/70">
              Discover our most popular skincare solutions loved by customers
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex h-[400px] flex-col items-center justify-center rounded-lg bg-white p-4 shadow-md"
              >
                <div className="size-40 rounded-lg bg-gray-200"></div>
                <div className="mt-4 h-6 w-3/4 rounded bg-gray-200"></div>
                <div className="mt-2 h-4 w-1/2 rounded bg-gray-200"></div>
                <div className="mt-auto flex w-full justify-between">
                  <div className="h-6 w-1/4 rounded bg-gray-200"></div>
                  <div className="h-8 w-1/3 rounded-full bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-[#F9F6F0] py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="mb-12 text-center"
        >
          <motion.h2
            variants={itemVariants}
            className="mb-4 font-inter text-3xl font-bold text-[#3A4D39] md:text-4xl"
          >
            Best Selling Products
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mx-auto max-w-2xl text-[#3A4D39]/70"
          >
            Discover our most popular skincare solutions loved by customers
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard cosmetic={product} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default BestsellingProducts
