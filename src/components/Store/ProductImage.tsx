import React from 'react'
import { motion } from 'framer-motion'

const ProductImage: React.FC = () => {
  return (
    <div className="flex w-3/5 flex-col max-md:ml-0 max-md:w-full">
      <motion.img
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/866f03b1126b552963088927ab1354e532e4e786039d557d037f1e0378571d45"
        className="aspect-[1.03] w-full grow object-contain max-md:mt-8 max-md:max-w-full max-sm:mt-3.5"
        alt="Renewal Night Cream product image"
      />
    </div>
  )
}

export default ProductImage
