import React from 'react'
import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'

const Sidebar: React.FC = () => {
  const categories = ['Cleansers', 'Toners', 'Serums']
  const skinConcerns = ['Acne', 'Aging', 'Hyperpigmentation']

  const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  }

  const [priceRange, setPriceRange] = React.useState([0])

  return (
    <motion.aside
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col rounded-lg bg-white p-6 shadow-sm"
    >
      <motion.section variants={itemVariants} className="mb-8">
        <h2 className="mb-4 text-base font-medium text-gray-900">Categories</h2>
        <div className="space-y-4">
          {categories.map((category) => (
            <motion.div
              key={category}
              whileHover={{ x: 5 }}
              className="flex items-center space-x-2"
            >
              <Checkbox id={`category-${category.toLowerCase()}`} />
              <label
                htmlFor={`category-${category.toLowerCase()}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category}
              </label>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={itemVariants} className="mb-8">
        <h2 className="mb-4 text-base font-medium text-gray-900">
          Skin Concerns
        </h2>
        <div className="space-y-4">
          {skinConcerns.map((concern) => (
            <motion.div
              key={concern}
              whileHover={{ x: 5 }}
              className="flex items-center space-x-2"
            >
              <Checkbox id={`concern-${concern.toLowerCase()}`} />
              <label
                htmlFor={`concern-${concern.toLowerCase()}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {concern}
              </label>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={itemVariants}>
        <h2 className="mb-4 text-base font-medium text-gray-900">
          Price Range
        </h2>
        <div className="px-2">
          <Slider
            defaultValue={[0]}
            max={200}
            step={1}
            value={priceRange}
            onValueChange={setPriceRange}
          />
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>${priceRange[0]}</span>
            <span>$200+</span>
          </div>
        </div>
      </motion.section>
    </motion.aside>
  )
}

export default Sidebar
