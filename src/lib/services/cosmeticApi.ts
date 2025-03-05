import { ApiResponse } from '@/lib/types/base/Api'
import { CosmeticResponse } from '@/lib/types/Cosmetic'
import axiosClient from '../api/axiosClient'

interface ImageUploadPayload {
  cosmeticId: string
  images: string[] // Array of base64 strings
}

const cosmeticApi = {
  getCosmetics: () =>
    axiosClient.get<ApiResponse<CosmeticResponse[]>>('/cosmetics'),
  getCosmeticById: (id: string) =>
    axiosClient.get<ApiResponse<CosmeticResponse>>(
      `/cosmetic/get-by-id?id=${id}`
    ),
  deleteCosmetic: (id: string) =>
    axiosClient.delete<ApiResponse<void>>(`/cosmetics/${id}`),
  uploadCosmeticImages: (payload: ImageUploadPayload) =>
    axiosClient.post<ApiResponse<void>>('/cosmetics/images', payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
}

export default cosmeticApi
