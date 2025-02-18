import React from 'react'
import { ProductCard } from '../../components/ProductCard'

const products = [
  {
    imageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/7e1fed01c40f1a7f044a66aca0e153a5ed752c1bd54841cda7ad5862bd0ad430?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    title: 'Renewal Night Cream',
    description: 'Rich moisturizing cream with natural extracts',
    price: '$89.00'
  },
  {
    imageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/93175b3ef23a838d07b312a11cd9409acb23f04c6b28613e52e00a8bcb72709c?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    title: 'Vitamin C Serum',
    description: 'Brightening formula with 20% Vitamin C',
    price: '$75.00'
  },
  {
    imageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/502832db11429b604680472638a3f8621487ea96a153661274824baa1ee0acf5?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    title: 'Radiance Face Oil',
    description: 'Nourishing blend of natural oils',
    price: '$65.00'
  },
  {
    imageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/d3749484c9f854c8c506194af4551de113a3c9b1770f391bf91f5e0feaf6d14d?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    title: 'Purifying Clay Mask',
    description: 'Deep cleansing mask with kaolin clay',
    price: '$55.00'
  }
]

export const BestsellingProducts: React.FC = () => {
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
                className="group transition-all duration-300 hover:scale-105"
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
