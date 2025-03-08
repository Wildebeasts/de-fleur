import { useQuery } from '@tanstack/react-query'
import cosmeticApi from '../services/cosmeticApi'
import { CosmeticResponse } from '../types/Cosmetic'
import { PaginatedList } from '../types/common/PaginatedList'

export const useCosmetics = () => {
  return useQuery<PaginatedList<CosmeticResponse>, Error>({
    queryKey: ['shop'],
    queryFn: async () => {
      const response = await cosmeticApi.getCosmetics()
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Failed to fetch cosmetics')
      }
      return (
        response.data.data || {
          items: [],
          totalPages: 0,
          totalCount: 0,
          pageIndex: 1,
          pageSize: 10,
          hasPreviousPage: false,
          hasNextPage: false
        }
      )
    }
  })
}
