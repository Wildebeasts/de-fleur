import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Star, Users, Clock } from 'lucide-react'

interface Collection {
  title: string
  description: string
  image: string
  productCount: number
  rating: number
  reviewCount: number
  featured: boolean
  bestSellers: {
    name: string
    image: string
    price: string
  }[]
  tags: string[]
  launchDate: string
}

const collections: Collection[] = [
  {
    title: 'Brightening Collection',
    description:
      'Illuminate your skin with our vitamin C enriched products. Perfect for dull, uneven skin tone and hyperpigmentation.',
    image:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/7e1fed01c40f1a7f044a66aca0e153a5ed752c1bd54841cda7ad5862bd0ad430',
    productCount: 4,
    rating: 4.8,
    reviewCount: 256,
    featured: true,
    bestSellers: [
      {
        name: 'Vitamin C Serum',
        image:
          'https://cdn.builder.io/api/v1/image/assets/TEMP/93175b3ef23a838d07b312a11cd9409acb23f04c6b28613e52e00a8bcb72709c',
        price: '$75.00'
      },
      {
        name: 'Brightening Moisturizer',
        image:
          'https://cdn.builder.io/api/v1/image/assets/TEMP/502832db11429b604680472638a3f8621487ea96a153661274824baa1ee0acf5',
        price: '$65.00'
      }
    ],
    tags: ['Vitamin C', 'Niacinamide', 'Alpha Arbutin'],
    launchDate: 'New Collection'
  },
  {
    title: 'Hydration Essentials',
    description: 'Deep moisturizing products for all skin types',
    image:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/93175b3ef23a838d07b312a11cd9409acb23f04c6b28613e52e00a8bcb72709c',
    productCount: 3,
    rating: 4.7,
    reviewCount: 189,
    featured: false,
    bestSellers: [
      {
        name: 'Hydrating Serum',
        image:
          'https://cdn.builder.io/api/v1/image/assets/TEMP/93175b3ef23a838d07b312a11cd9409acb23f04c6b28613e52e00a8bcb72709c',
        price: '$68.00'
      },
      {
        name: 'Moisture Cream',
        image:
          'https://cdn.builder.io/api/v1/image/assets/TEMP/502832db11429b604680472638a3f8621487ea96a153661274824baa1ee0acf5',
        price: '$72.00'
      }
    ],
    tags: ['Hyaluronic Acid', 'Ceramides', 'Peptides'],
    launchDate: ''
  },
  {
    title: 'Anti-Aging Solutions',
    description: 'Target fine lines and wrinkles with proven ingredients',
    image:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/502832db11429b604680472638a3f8621487ea96a153661274824baa1ee0acf5',
    productCount: 5,
    rating: 4.6,
    reviewCount: 167,
    featured: false,
    bestSellers: [
      {
        name: 'Retinol Serum',
        image:
          'https://cdn.builder.io/api/v1/image/assets/TEMP/502832db11429b604680472638a3f8621487ea96a153661274824baa1ee0acf5',
        price: '$82.00'
      },
      {
        name: 'Night Cream',
        image:
          'https://cdn.builder.io/api/v1/image/assets/TEMP/7e1fed01c40f1a7f044a66aca0e153a5ed752c1bd54841cda7ad5862bd0ad430',
        price: '$78.00'
      }
    ],
    tags: ['Retinol', 'Peptides', 'Collagen'],
    launchDate: ''
  },
  {
    title: 'Sensitive Skin Care',
    description: 'Gentle formulations for sensitive and reactive skin',
    image:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/d3749484c9f854c8c506194af4551de113a3c9b1770f391bf91f5e0feaf6d14d',
    productCount: 3,
    rating: 4.5,
    reviewCount: 142,
    featured: false,
    bestSellers: [
      {
        name: 'Gentle Cleanser',
        image:
          'https://cdn.builder.io/api/v1/image/assets/TEMP/d3749484c9f854c8c506194af4551de113a3c9b1770f391bf91f5e0feaf6d14d',
        price: '$45.00'
      },
      {
        name: 'Calming Serum',
        image:
          'https://cdn.builder.io/api/v1/image/assets/TEMP/93175b3ef23a838d07b312a11cd9409acb23f04c6b28613e52e00a8bcb72709c',
        price: '$65.00'
      }
    ],
    tags: ['Fragrance-Free', 'Hypoallergenic', 'Soothing'],
    launchDate: ''
  }
]

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
          {collections.map((collection, index) => (
            <motion.div
              key={index}
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
                  <span className="rounded-full bg-[#D1E2C4] px-3 py-1 text-sm text-[#3A4D39]">
                    {collection.productCount} Products
                  </span>
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

                <div className="mt-6 space-y-4">
                  <h3 className="text-sm font-medium text-gray-600">
                    Bestsellers in this collection:
                  </h3>
                  <div className="flex gap-4">
                    {collection.bestSellers.map((product, idx) => (
                      <div key={idx} className="w-24">
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
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <Button className="flex-1 bg-rose-300 text-black hover:bg-rose-400">
                    View Collection
                  </Button>
                  <Button
                    variant="outline"
                    className="border-rose-200 hover:bg-rose-50"
                  >
                    Quick View
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default CollectionsLayout
