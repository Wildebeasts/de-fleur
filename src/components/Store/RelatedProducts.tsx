import React from 'react'
import { motion } from 'framer-motion'

interface RelatedProduct {
  image: string
  name: string
  price: string
}

interface RelatedProductsProps {
  products: RelatedProduct[]
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ products }) => {
  return (
    <div className="mt-16 flex w-full flex-col py-px max-md:mt-10 max-md:max-w-full">
      <h2 className="self-start text-2xl leading-none text-black">
        Complete Your Routine
      </h2>
      <div className="mt-10 max-md:max-w-full">
        <div className="flex gap-5 max-md:flex-col">
          {products.map((product, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="flex w-3/12 flex-col max-md:ml-0 max-md:w-full"
            >
              <div className="flex w-full grow flex-col items-start pb-2 text-base leading-none max-md:mt-6">
                <img
                  loading="lazy"
                  src={product.image}
                  className="aspect-[1.15] w-full self-stretch rounded-lg object-contain"
                  alt={product.name}
                />
                <div className="mt-5 font-medium text-black">
                  {product.name}
                </div>
                <div className="mt-3 text-gray-600">{product.price}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RelatedProducts
