import React from 'react'
import { motion } from 'framer-motion'
import Breadcrumb from '../../components/Store/Breadcrumb'
import Sidebar from '../../components/Store/Sidebar'
import ProductGrid from '../../components/Store/ProductGrid'
import Pagination from '../../components/Store/Pagination'

const ShopSearchPage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex w-full flex-col bg-orange-50/80 px-20 py-8 backdrop-blur-sm max-md:max-w-full max-md:px-5"
    >
      <motion.div
        variants={itemVariants}
        className="flex w-full max-w-7xl flex-col gap-8 self-center"
      >
        <Breadcrumb />
        <div className="flex gap-8">
          <motion.div variants={itemVariants} className="w-[21%] max-md:w-full">
            <Sidebar />
          </motion.div>
          <motion.main variants={itemVariants} className="flex-1">
            <div className="mx-auto flex w-full flex-col max-md:mt-8 max-md:max-w-full">
              <ProductGrid />
              <Pagination />
            </div>
          </motion.main>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ShopSearchPage
