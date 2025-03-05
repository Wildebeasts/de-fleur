import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { CosmeticTypeResponse } from '@/lib/types/CosmeticType'
import { BrandResponse } from '@/lib/types/Brand'
import { CategoryResponse } from '@/lib/types/Category'
import categoryApi from '@/lib/services/categoryApi'
import brandApi from '@/lib/services/brandApi'
import cosmeticTypeApi from '@/lib/services/cosmeticTypeApi'
import { useCosmetic } from '@/lib/context/CosmeticContext'
import { SubCategoryResponse } from '@/lib/types/SubCategory'
import subCategoryApi from '@/lib/services/subCategoryApi'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@radix-ui/react-accordion'

const Sidebar: React.FC = () => {
  // const categories = ['Cleansers', 'Toners', 'Serums']
  // const skinConcerns = ['Acne', 'Aging', 'Hyperpigmentation']

  const {
    selectedCategories,
    setSelectedCategories,
    selectedBrands,
    setSelectedBrands,
    selectedCosmeticTypes,
    setSelectedCosmeticTypes,
    selectedConcerns,
    setSelectedConcerns,
    priceRange,
    setPriceRange
  } = useCosmetic()

  const handleSelectionChange = (
    selectedList: string[],
    setSelectedList: (list: string[]) => void,
    value: string
  ) => {
    setSelectedList(
      selectedList.includes(value)
        ? selectedList.filter((item) => item !== value)
        : [...selectedList, value]
    )
  }

  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [subCategories, setSubCategories] = useState<SubCategoryResponse[]>([])
  const [brands, setBrands] = useState<BrandResponse[]>([])
  const [cosmeticTypes, setCosmeticTypes] = useState<CosmeticTypeResponse[]>([])

  useEffect(() => {
    categoryApi.getCategories().then((response) => {
      if (response.data.isSuccess) {
        setCategories(response.data.data!)
      }
    })

    brandApi.getBrands().then((response) => {
      if (response.data.isSuccess) {
        setBrands(response.data.data!)
      }
    })

    cosmeticTypeApi.getCosmeticTypes().then((response) => {
      if (response.data.isSuccess) {
        setCosmeticTypes(response.data.data!)
      }
    })

    subCategoryApi.getSubCategories().then((response) => {
      if (response.data.isSuccess) {
        setSubCategories(response.data.data!)
      }
    })
  }, [])

  const skinAttributes = [
    { key: 'isDry', label: 'Dry' },
    { key: 'isSensitive', label: 'Sensitive' },
    { key: 'isUneven', label: 'Pigmented' },
    { key: 'isWrinkle', label: 'Wrinkle-Prone' }
  ]

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
              key={category.id}
              whileHover={{ x: 5 }}
              className="flex items-center space-x-2"
            >
              {/* <Checkbox
                id={`category-${category.name.toLowerCase()}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() =>
                  handleSelectionChange(
                    selectedCategories,
                    setSelectedCategories,
                    category.id
                  )
                }
              />
              <label
                htmlFor={`category-${category.name.toLowerCase()}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category.name}
              </label> */}
              <Accordion
                key={category.id}
                type="single"
                collapsible
                className="w-full"
              >
                <AccordionItem value={category.id}>
                  <AccordionTrigger>{category.name}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-4">
                      {subCategories
                        .filter((sub) => sub.categoryId === category.id)
                        .map((subCategory) => (
                          <motion.div
                            key={subCategory.id}
                            whileHover={{ x: 5 }}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`subcategory-${subCategory.name.toLowerCase()}`}
                              checked={selectedCategories.includes(
                                subCategory.id
                              )}
                              onCheckedChange={() =>
                                handleSelectionChange(
                                  selectedCategories,
                                  setSelectedCategories,
                                  subCategory.id
                                )
                              }
                            />
                            <label
                              htmlFor={`subcategory-${subCategory.name.toLowerCase()}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {subCategory.name}
                            </label>
                          </motion.div>
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={itemVariants} className="mb-8">
        <h2 className="mb-4 text-base font-medium text-gray-900">Brands</h2>
        <div className="space-y-4">
          {brands.map((brand) => (
            <motion.div
              key={brand.id}
              whileHover={{ x: 5 }}
              className="flex items-center space-x-2"
            >
              <Checkbox
                id={`brand-${brand.name.toLowerCase()}`}
                checked={selectedBrands.includes(brand.id)}
                onCheckedChange={() =>
                  handleSelectionChange(
                    selectedBrands,
                    setSelectedBrands,
                    brand.id
                  )
                }
              />
              <label
                htmlFor={`brand-${brand.name.toLowerCase()}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {brand.name}
              </label>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={itemVariants} className="mb-8">
        <h2 className="mb-4 text-base font-medium text-gray-900">
          Product Types
        </h2>
        <div className="space-y-4">
          {cosmeticTypes.map((cosmeticType) => (
            <motion.div
              key={cosmeticType.id}
              whileHover={{ x: 5 }}
              className="flex items-center space-x-2"
            >
              <Checkbox
                id={`cosmeticType-${cosmeticType.name.toLowerCase()}`}
                checked={selectedCosmeticTypes.includes(cosmeticType.id)}
                onCheckedChange={() =>
                  handleSelectionChange(
                    selectedCosmeticTypes,
                    setSelectedCosmeticTypes,
                    cosmeticType.id
                  )
                }
              />
              <label
                htmlFor={`cosmeticType-${cosmeticType.name.toLowerCase()}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {cosmeticType.name}
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
          {skinAttributes.map((skinType) => (
            <motion.div
              key={skinType.key}
              whileHover={{ x: 5 }}
              className="flex items-center space-x-2"
            >
              <Checkbox
                id={`skinType-${skinType.label.toLowerCase()}`}
                checked={selectedConcerns.includes(skinType.label)}
                onCheckedChange={() =>
                  handleSelectionChange(
                    selectedConcerns,
                    setSelectedConcerns,
                    skinType.label
                  )
                }
              />
              <label
                htmlFor={`skinType-${skinType.label.toLowerCase()}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {skinType.label}
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
            max={4000000}
            step={100000}
            value={priceRange}
            onValueChange={setPriceRange}
          />
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>{priceRange[0]}</span>
            <span>{priceRange[1]}</span>
          </div>
        </div>
      </motion.section>
    </motion.aside>
  )
}

export default Sidebar
