import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ProductCard from './ProductCard'
import { CosmeticResponse } from '@/lib/types/Cosmetic'
import cosmeticApi from '@/lib/services/cosmeticApi'

// interface Product {
//   id: string
//   title: string
//   description: string
//   price: string
//   imageSrc: string
//   isNew?: boolean
//   rating?: number
//   reviewCount?: number
// }

const ProductGrid: React.FC = () => {
  // Sample product data - replace with your actual data
  // const products: Product[] = [
  //   {
  //     id: '1',
  //     title: 'Vitamin C Brightening Serum',
  //     description: 'Advanced formula for radiant skin',
  //     price: '$68.00',
  //     imageSrc:
  //       'https://cdn.builder.io/api/v1/image/assets/TEMP/5601b244a695bdf6e6696f50c1b6d1beeb7b5877098233b16a614080b6cb9ccc?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
  //     isNew: true,
  //     rating: 4.5,
  //     reviewCount: 124
  //   }
  //   // Add more products...
  // ]

  const [cosmetics, setCosmetics] = useState<CosmeticResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    cosmeticApi
      .getCosmetics()
      .then((response) => {
        if (response.data.isSuccess) {
          console.log(response.data)
          setCosmetics(response.data.data!)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('Error fetching quiz:', err)
        setLoading(true)
      })
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {cosmetics.map((cosmetic, index) => (
        <motion.div
          key={cosmetic.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ProductCard cosmetic={cosmetic} />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default ProductGrid
