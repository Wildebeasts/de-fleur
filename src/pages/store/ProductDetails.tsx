import React from 'react'
import { motion } from 'framer-motion'
import ProductImage from '../../components/Store/ProductImage'
import ProductInfo from '../../components/Store/ProductInfo'
import ProductDescription from '../../components/Store/ProductDescription'
import RelatedProducts from '../../components/Store/RelatedProducts'

interface ProductDetailsProps {
  productId: string
  productName: string
  price: number
  reviewCount: number
  description: string
  features: Array<{
    icon: string
    title: string
    description: string
  }>
  relatedProducts: Array<{
    image: string
    name: string
    price: number
    id?: string
  }>
  productImage?: string
  cosmeticImages?: Array<{ id: string; imageUrl: string }>
  ingredients?: string
  instructions?: string
  feedbacks?: Array<{
    id: string
    customerId: string
    customer: {
      id: string
      email: string
      userName: string
    }
    content: string | null
    rating: number
  }>
  cosmeticSubCategories: Array<{
    subCategory: {
      id: string
      name: string
      description: string
    }
  }>
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  productId,
  productName,
  price,
  reviewCount,
  description,
  features,
  relatedProducts,
  productImage,
  cosmeticImages,
  ingredients,
  instructions,
  feedbacks,
  cosmeticSubCategories
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const finalCosmeticImages =
    cosmeticImages?.filter((img) => img && img.imageUrl) || []

  return (
    <motion.div
      className="flex items-center justify-center gap-2.5 p-2.5"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="my-auto flex w-[1440px] min-w-[240px] flex-col self-stretch overflow-hidden bg-white">
        <div className="flex w-full flex-col">
          <div className="flex flex-col bg-white max-md:max-w-full">
            <div className="flex w-full flex-col justify-center whitespace-nowrap bg-white px-16 py-px leading-none max-md:max-w-full max-md:px-5" />
            <div className="flex w-full max-w-screen-xl flex-col self-center px-4 pb-8 max-md:max-w-full">
              <motion.div variants={itemVariants} className="max-md:max-w-full">
                <div className="flex gap-5 max-md:flex-col">
                  <ProductImage
                    imageUrl={productImage}
                    cosmeticImages={finalCosmeticImages}
                  />
                  <ProductInfo
                    productId={productId}
                    productName={productName}
                    price={price}
                    reviewCount={reviewCount}
                    cosmeticSubcategories={cosmeticSubCategories}
                  />
                </div>
              </motion.div>
              <motion.div variants={itemVariants}>
                <ProductDescription
                  description={description}
                  features={features}
                  ingredients={ingredients}
                  instructions={instructions}
                  feedbacks={feedbacks}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <RelatedProducts products={relatedProducts} />
              </motion.div>
            </div>
            <div className="mt-16 flex flex-col bg-orange-50 px-20 max-md:mt-10 max-md:max-w-full max-md:px-5" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductDetails
