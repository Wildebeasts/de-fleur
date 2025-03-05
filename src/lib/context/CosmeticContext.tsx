import { createContext, useContext, useEffect, useState } from 'react'
import { CosmeticResponse } from '@/lib/types/Cosmetic'
import cosmeticApi from '@/lib/services/cosmeticApi'

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
  const [cosmetics, setCosmetics] = useState<CosmeticResponse[]>([])
  const [filteredCosmetics, setFilteredCosmetics] = useState<
    CosmeticResponse[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCosmeticTypes, setSelectedCosmeticTypes] = useState<string[]>(
    []
  )
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<number[]>([0, 2000000])

  // Fetch cosmetics when component mounts
  useEffect(() => {
    const fetchCosmetics = async () => {
      try {
        setIsLoading(true)
        const response = await cosmeticApi.getCosmetics()
        console.log('API Response:', response.data)
        if (response.data.isSuccess) {
          setCosmetics(response.data.data || [])
          setFilteredCosmetics(response.data.data || [])
        } else {
          throw new Error(response.data.message || 'Failed to fetch cosmetics')
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCosmetics()
  }, [])

  // Filter cosmetics when filters change
  useEffect(() => {
    console.log('Starting filters with cosmetics:', cosmetics.length)

    let filtered = [...cosmetics]

    // Only apply filters if there are active filters
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((cosmetic) =>
        cosmetic.cosmeticSubcategories?.some((sub) =>
          selectedCategories.includes(sub.subCategoryId)
        )
      )
      console.log('After category filter:', filtered.length)
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((cosmetic) =>
        selectedBrands.includes(cosmetic.brandId)
      )
      console.log('After brand filter:', filtered.length)
    }

    if (selectedCosmeticTypes.length > 0) {
      filtered = filtered.filter((cosmetic) =>
        selectedCosmeticTypes.includes(cosmetic.cosmeticTypeId)
      )
      console.log('After type filter:', filtered.length)
    }

    if (selectedConcerns.length > 0) {
      filtered = filtered.filter((cosmetic) =>
        selectedConcerns.every((concern) => {
          switch (concern) {
            case 'Dry':
              return cosmetic.skinType?.isDry
            case 'Sensitive':
              return cosmetic.skinType?.isSensitive
            case 'Pigmented':
              return cosmetic.skinType?.isUneven
            case 'Wrinkle-Prone':
              return cosmetic.skinType?.isWrinkle
            default:
              return false
          }
        })
      )
      console.log('After concerns filter:', filtered.length)
    }

    // Price filter for VND (only apply if not at min/max)
    if (priceRange[0] > 0 || priceRange[1] < 2000000) {
      filtered = filtered.filter(
        (cosmetic) =>
          cosmetic.price >= priceRange[0] && cosmetic.price <= priceRange[1]
      )
      console.log('After price filter:', filtered.length)
    }

    console.log('Final filtered cosmetics:', filtered.length)
    setFilteredCosmetics(filtered)
  }, [
    cosmetics,
    selectedCategories,
    selectedBrands,
    selectedCosmeticTypes,
    selectedConcerns,
    priceRange
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
