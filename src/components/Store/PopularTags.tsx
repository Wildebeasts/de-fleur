import cosmeticTypeApi from '@/lib/services/cosmeticTypeApi'
import { CosmeticTypeResponse } from '@/lib/types/CosmeticType'
import React, { useEffect, useState } from 'react'

const PopularTags: React.FC = () => {
  const [cosmeticTypes, setCosmeticTypes] = useState<CosmeticTypeResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCosmeticTypes = async () => {
      try {
        const response = await cosmeticTypeApi.getCosmeticTypes()
        if (response.data.isSuccess) {
          setCosmeticTypes(response.data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch cosmetic types:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCosmeticTypes()
  }, [])

  if (isLoading) return <p>Loading tags...</p>
  return (
    <div className="mt-4 flex flex-wrap gap-4 pr-20 text-sm text-zinc-800 max-md:pr-5">
      <div className="my-auto leading-none">Popular:</div>
      {cosmeticTypes.map((type: CosmeticTypeResponse) => (
        <button
          key={type.id}
          className="rounded-full bg-[#E8F5E9] px-3 py-1 text-sm font-medium text-[#3A4D39] transition-colors hover:bg-[#C5E1A5]"
          aria-label={`Search for ${type.name}`}
        >
          {type.name}
        </button>
      ))}
    </div>
  )
}

export default PopularTags
