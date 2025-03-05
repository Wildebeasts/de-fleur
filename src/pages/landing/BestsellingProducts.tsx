import React from 'react'
import { ProductCard } from '../../components/ProductCard'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import cosmeticApi from '@/lib/services/cosmeticApi'
import { Loader2 } from 'lucide-react'

// Fallback products in case API fails
const fallbackProducts = [
  {
    id: 'product-1',
    imageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/7e1fed01c40f1a7f044a66aca0e153a5ed752c1bd54841cda7ad5862bd0ad430?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    title: 'Renewal Night Cream',
    description: 'Rich moisturizing cream with natural extracts',
    price: '$89.00'
  },
  {
    id: 'product-2',
    imageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/93175b3ef23a838d07b312a11cd9409acb23f04c6b28613e52e00a8bcb72709c?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    title: 'Vitamin C Serum',
    description: 'Brightening formula with 20% Vitamin C',
    price: '$75.00'
  },
  {
    id: 'product-3',
    imageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/502832db11429b604680472638a3f8621487ea96a153661274824baa1ee0acf5?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    title: 'Radiance Face Oil',
    description: 'Nourishing blend of natural oils',
    price: '$65.00'
  },
  {
    id: 'product-4',
    imageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/d3749484c9f854c8c506194af4551de113a3c9b1770f391bf91f5e0feaf6d14d?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    title: 'Purifying Clay Mask',
    description: 'Deep cleansing mask with kaolin clay',
    price: '$55.00'
  }
]

export const BestsellingProducts: React.FC = () => {
  const navigate = useNavigate()

  // Fetch products from API
  const { data: cosmetics, isLoading } = useQuery({
    queryKey: ['bestsellers'],
    queryFn: async () => {
      const response = await cosmeticApi.getCosmetics()
      if (response.data.isSuccess) {
        return response.data.data
      }
      throw new Error('Failed to fetch products')
    }
  })

  // Process products for display
  const products = React.useMemo(() => {
    if (!cosmetics || cosmetics.length === 0) return fallbackProducts

    // Sort by popularity, rating, or any other criteria you want
    // Here we're just taking the first 4 products
    return cosmetics.slice(0, 4).map((product) => ({
      id: product.id,
      imageSrc:
        typeof product.cosmeticImages?.[0] === 'object' &&
        product.cosmeticImages?.[0] !== null
          ? (product.cosmeticImages[0] as { imageUrl?: string }).imageUrl || ''
          : typeof product.cosmeticImages?.[0] === 'string'
            ? product.cosmeticImages[0]
            : 'https://cdn.builder.io/api/v1/image/assets/TEMP/7e1fed01c40f1a7f044a66aca0e153a5ed752c1bd54841cda7ad5862bd0ad430',
      title: product.name || 'Unnamed Product',
      description:
        product.notice || product.mainUsage || 'Premium skincare product',
      price: product.price
    }))
  }, [cosmetics])

  const handleProductClick = (productId: string) => {
    navigate({
      to: '/shopDetails',
      search: {
        productId
      }
    })
  }

  if (isLoading) {
    return (
      <section className="flex h-96 items-center justify-center bg-gradient-to-b from-white to-[#F9F5F0] px-20 py-16 max-md:px-5">
        <Loader2 className="size-8 animate-spin text-[#3A4D39]" />
        <span className="ml-2 text-lg text-[#3A4D39]">
          Loading bestsellers...
        </span>
      </section>
    )
  }

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-white to-[#F9F5F0] px-20 py-32 max-md:px-5"
      aria-labelledby="bestselling-title"
    >
      {/* Decorative elements */}
      <div className="absolute left-0 top-0 size-96 -translate-x-1/2 rounded-full bg-[#D1E2C4]/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 size-96 translate-x-1/2 rounded-full bg-[#A7C4BC]/20 blur-3xl" />

      <div className="relative flex w-full flex-col px-4 max-md:max-w-full">
        <div className="mb-16 text-center">
          <h2
            id="bestselling-title"
            className="mb-6 text-6xl font-semibold text-[#3A4D39]"
          >
            Bestselling Products
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-[#3A4D39]/80">
            Discover our most loved natural skincare products, carefully crafted
            for your beauty routine.
          </p>
        </div>

        <div className="mt-14 max-md:mt-10 max-md:max-w-full">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => (
              <div
                key={index}
                className="group cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={() => handleProductClick(product.id)}
              >
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default BestsellingProducts
