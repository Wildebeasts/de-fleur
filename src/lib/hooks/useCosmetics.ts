import { useQuery } from '@tanstack/react-query'
import cosmeticApi from '../services/cosmeticApi'
import { CosmeticResponse } from '../types/Cosmetic'

export const useCosmetics = () => {
  return useQuery<CosmeticResponse[], Error>({
    queryKey: ['shop'],
    queryFn: async () => {
      const response = await cosmeticApi.getCosmetics()
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Failed to fetch cosmetics')
      }
      return response.data.data || []
    }
  })
}
