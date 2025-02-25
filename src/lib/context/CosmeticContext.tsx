import { createContext, useContext, useEffect, useState } from 'react'
import { CosmeticResponse } from '@/lib/types/Cosmetic'
import { useCosmetics } from '@/lib/hooks/useCosmetics'

interface CosmeticContextType {
  filteredCosmetics: CosmeticResponse[] | null
  isLoading: boolean
  error: Error | null
  selectedCategories: string[]
  setSelectedCategories: (categories: string[]) => void
  selectedBrands: string[]
  setSelectedBrands: (brands: string[]) => void
  selectedCosmeticTypes: string[]
  setSelectedCosmeticTypes: (cosmeticTypes: string[]) => void
  selectedConcerns: string[]
  setSelectedConcerns: (skinTypes: string[]) => void
  priceRange: number[]
  setPriceRange: (prices: number[]) => void
}

const CosmeticContext = createContext<CosmeticContextType | null>(null)

export const CosmeticProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { data: cosmetics = [], isLoading, error } = useCosmetics()
  const [filteredCosmetics, setFilteredCosmetics] = useState<
    CosmeticResponse[]
  >([])

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCosmeticTypes, setSelectedCosmeticTypes] = useState<string[]>(
    []
  )
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 200])

  useEffect(() => {
    if (cosmetics.length > 0) {
      setFilteredCosmetics(cosmetics)
    }
  }, [cosmetics])

  useEffect(() => {
    let filtered = cosmetics

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((cosmetic) =>
        cosmetic.cosmeticSubcategories.some((sub) =>
          selectedCategories.includes(sub.id)
        )
      )
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((cosmetic) =>
        selectedBrands.includes(cosmetic.brandId)
      )
    }

    if (selectedCosmeticTypes.length > 0) {
      filtered = filtered.filter((cosmetic) =>
        selectedCosmeticTypes.includes(cosmetic.cosmeticTypeId)
      )
    }

    if (selectedConcerns.length > 0) {
      filtered = filtered.filter((cosmetic) =>
        selectedConcerns.every((skinType) => {
          if (skinType === 'Dry') return cosmetic.skinType.isDry
          if (skinType === 'Sensitive') return cosmetic.skinType.isSensitive
          if (skinType === 'Pigmented') return cosmetic.skinType.isUneven
          if (skinType === 'Wrinkle-Prone') return cosmetic.skinType.isWrinkle
          return false
        })
      )
    }

    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    )

    setFilteredCosmetics(filtered)
  }, [
    selectedCategories,
    selectedBrands,
    selectedCosmeticTypes,
    selectedConcerns,
    priceRange,
    cosmetics
  ])

  return (
    <CosmeticContext.Provider
      value={{
        filteredCosmetics,
        isLoading,
        error,
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
      }}
    >
      {children}
    </CosmeticContext.Provider>
  )
}

export const useCosmetic = () => {
  const context = useContext(CosmeticContext)
  if (!context) {
    throw new Error('useCosmetic must be used within a CosmeticProvider')
  }
  return context
}
