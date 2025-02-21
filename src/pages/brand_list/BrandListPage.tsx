import React from 'react'
import { motion } from 'framer-motion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Animation variants (following pattern from):
// Reference: src/pages/about/AboutLayout.tsx (lines 4-18)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const brands = [
  {
    name: 'Naturelle',
    description: 'Clean beauty essentials with natural ingredients',
    logo: 'https://placeholder.com/150',
    featured: true,
    productCount: 24
  },
  {
    name: 'Pure Botanics',
    description: 'Botanical-based skincare solutions',
    logo: 'https://placeholder.com/150',
    featured: false,
    productCount: 18
  }
  // Add more brands as needed
]

const BrandListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('')

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-orange-50/80 to-white px-4 py-16"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div variants={itemVariants} className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-semibold text-[#3A4D39]">
            Our Brand Partners
          </h1>
          <p className="text-lg text-[#3A4D39]/80">
            Discover our curated selection of premium skincare brands
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search brands..."
              className="w-full rounded-full border-[#D1E2C4] px-6 py-3 focus-visible:ring-[#3A4D39]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3A4D39] hover:text-[#4A5D49]"
                onClick={() => setSearchTerm('')}
              >
                Clear
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {brands
            .filter((brand) =>
              brand.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((brand) => (
              <motion.div
                key={brand.name}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card className="relative overflow-hidden border-[#D1E2C4] shadow-lg">
                  {brand.featured && (
                    <div className="absolute right-4 top-4 z-10 rounded-full bg-rose-500 px-4 py-1 text-sm text-white">
                      Featured Brand
                    </div>
                  )}
                  <CardHeader>
                    <div className="mb-4 flex justify-center">
                      <img
                        src={brand.logo}
                        alt={`${brand.name} logo`}
                        className="size-24 rounded-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-center text-xl text-[#3A4D39]">
                      {brand.name}
                    </CardTitle>
                    <CardDescription className="text-center text-[#3A4D39]/60">
                      {brand.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm text-[#3A4D39]/80">
                      <span>{brand.productCount} Products</span>
                      <Button
                        variant="ghost"
                        className="text-[#3A4D39] hover:text-[#4A5D49]"
                      >
                        View Collection →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default BrandListPage
