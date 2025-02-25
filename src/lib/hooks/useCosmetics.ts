import { useQuery, UseQueryResult } from '@tanstack/react-query'
import cosmeticApi from '../services/cosmeticApi'
import { CosmeticResponse } from '../types/Cosmetic'

export function useCosmetics(): UseQueryResult<CosmeticResponse[], Error> {
  return useQuery({
    queryKey: ['cosmetics'],
    queryFn: async () => {
      const response = await cosmeticApi.getCosmetics()
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Failed to fetch cosmetics')
      }
      return response.data.data || []
    }
  })
}
