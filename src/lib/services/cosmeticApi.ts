import { ApiResponse } from '@/lib/types/base/Api'
import { CosmeticResponse } from '@/lib/types/Cosmetic'
import axiosClient from '../api/axiosClient'

const cosmeticApi = {
  getCosmetics: () =>
    axiosClient.get<ApiResponse<CosmeticResponse[]>>('/cosmetics'),
  getCosmeticById: (id: string) =>
    axiosClient.get<ApiResponse<CosmeticResponse>>(
      `/cosmetic/get-by-id?id=${id}`
    ),
  deleteCosmetic: (id: string) =>
    axiosClient.delete<ApiResponse<void>>(`/cosmetics/${id}`)
}

export default cosmeticApi
