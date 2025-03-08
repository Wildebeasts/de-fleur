/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { BrandResponse } from '@/lib/types/Brand'
import { SkinTypeResponse } from '@/lib/types/SkinType'
import { CosmeticTypeResponse } from '@/lib/types/CosmeticType'
import { CosmeticFilter } from '@/lib/types/CosmeticFilter'
import brandApi from '@/lib/services/brandApi'
import skinTypeApi from '@/lib/services/skinTypeApi'
import cosmeticTypeApi from '@/lib/services/cosmeticTypeApi'

interface FilterSidebarProps {
  onFilterChange: (filters: CosmeticFilter) => void
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ onFilterChange }) => {
  // Filter states
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>()
  const [selectedSkinType, setSelectedSkinType] = useState<string | undefined>()
  const [selectedCosmeticType, setSelectedCosmeticType] = useState<
    string | undefined
  >()
  const [selectedGender, setSelectedGender] = useState<boolean | undefined>()
  const [priceRange, setPriceRange] = useState([0, 1000000])

  // Fetch filter options
  const { data: brands, isLoading: brandsLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await brandApi.getBrands()
      if (response.data.isSuccess) {
        return response.data.data
      }
      return [] as BrandResponse[]
    }
  })

  const { data: skinTypes, isLoading: skinTypesLoading } = useQuery({
    queryKey: ['skinTypes'],
    queryFn: async () => {
      const response = await skinTypeApi.getSkinTypes()
      if (response.data.isSuccess) {
        return response.data.data
      }
      return [] as SkinTypeResponse[]
    }
  })

  const { data: cosmeticTypes, isLoading: cosmeticTypesLoading } = useQuery({
    queryKey: ['cosmeticTypes'],
    queryFn: async () => {
      const response = await cosmeticTypeApi.getCosmeticTypes()
      if (response.data.isSuccess) {
        return response.data.data
      }
      return [] as CosmeticTypeResponse[]
    }
  })

  // Apply filters
  const applyFilters = () => {
    onFilterChange({
      brandId: selectedBrand,
      skinTypeId: selectedSkinType,
      cosmeticTypeId: selectedCosmeticType,
      gender: selectedGender,
      minPrice: priceRange[0],
      maxPrice: priceRange[1]
    })
  }

  // Reset filters
  const resetFilters = () => {
    setSelectedBrand(undefined)
    setSelectedSkinType(undefined)
    setSelectedCosmeticType(undefined)
    setSelectedGender(undefined)
    setPriceRange([0, 1000000])

    onFilterChange({})
  }

  // Apply filters when they change
  useEffect(() => {
    applyFilters()
  }, [
    selectedBrand,
    selectedSkinType,
    selectedCosmeticType,
    selectedGender,
    priceRange
  ])

  if (brandsLoading || skinTypesLoading || cosmeticTypesLoading) {
    return (
      <div className="flex h-20 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-[#3A4D39]" />
        <span className="ml-2 text-sm text-[#3A4D39]">Loading filters...</span>
      </div>
    )
  }

  return (
    <aside className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-[#3A4D39]">Filters</h2>

      {/* Price Range */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-medium text-[#3A4D39]">Price Range</h3>
        <Slider
          defaultValue={[0, 1000000]}
          min={0}
          max={1000000}
          step={50000}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mb-4"
        />
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#3A4D39]">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(priceRange[0])}
          </span>
          <span className="text-sm text-[#3A4D39]">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(priceRange[1])}
          </span>
        </div>
      </div>

      {/* Brands */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-medium text-[#3A4D39]">Brands</h3>
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {brands?.map((brand) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand.id}`}
                checked={selectedBrand === brand.id}
                onCheckedChange={(checked) =>
                  setSelectedBrand(checked ? brand.id : undefined)
                }
              />
              <Label
                htmlFor={`brand-${brand.id}`}
                className="text-sm text-[#3A4D39]"
              >
                {brand.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Skin Types */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-medium text-[#3A4D39]">Skin Types</h3>
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {skinTypes?.map((skinType) => (
            <div key={skinType.id} className="flex items-center space-x-2">
              <Checkbox
                id={`skin-${skinType.id}`}
                checked={selectedSkinType === skinType.id}
                onCheckedChange={(checked) =>
                  setSelectedSkinType(checked ? skinType.id : undefined)
                }
              />
              <Label
                htmlFor={`skin-${skinType.id}`}
                className="text-sm text-[#3A4D39]"
              >
                {skinType.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Cosmetic Types */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-medium text-[#3A4D39]">
          Product Types
        </h3>
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {cosmeticTypes?.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type.id}`}
                checked={selectedCosmeticType === type.id}
                onCheckedChange={(checked) =>
                  setSelectedCosmeticType(checked ? type.id : undefined)
                }
              />
              <Label
                htmlFor={`type-${type.id}`}
                className="text-sm text-[#3A4D39]"
              >
                {type.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-medium text-[#3A4D39]">Gender</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="gender-all"
              checked={selectedGender === undefined}
              onCheckedChange={() => setSelectedGender(undefined)}
            />
            <Label htmlFor="gender-all" className="text-sm text-[#3A4D39]">
              All
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="gender-female"
              checked={selectedGender === false}
              onCheckedChange={() => setSelectedGender(false)}
            />
            <Label htmlFor="gender-female" className="text-sm text-[#3A4D39]">
              Female
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="gender-male"
              checked={selectedGender === true}
              onCheckedChange={() => setSelectedGender(true)}
            />
            <Label htmlFor="gender-male" className="text-sm text-[#3A4D39]">
              Male
            </Label>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        className="w-full border-[#3A4D39] text-[#3A4D39] hover:bg-[#3A4D39] hover:text-white"
        onClick={resetFilters}
      >
        Reset Filters
      </Button>
    </aside>
  )
}

export default FilterSidebar
