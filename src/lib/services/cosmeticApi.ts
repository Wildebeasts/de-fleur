import { ApiResponse } from '@/lib/types/base/Api'
import { CosmeticResponse } from '@/lib/types/Cosmetic'
import axiosClient from '../api/axiosClient'

interface ImageUploadPayload {
  cosmeticId: string
  images: string[] | File[] // Array of base64 strings or File objects
}

const cosmeticApi = {
  getCosmetics: () => {
    return axiosClient.get<ApiResponse<CosmeticResponse[]>>('/cosmetics')
  },
  getCosmeticById: (id: string) =>
    axiosClient.get<ApiResponse<CosmeticResponse>>(
      `/cosmetics/get-by-id?id=${id}`
    ),
  deleteCosmetic: (id: string) =>
    axiosClient.delete<ApiResponse<void>>(`/cosmetics/${id}`),
  uploadCosmeticImages: (payload: { cosmeticId: string; images: File[] }) => {
    const formData = new FormData()
    formData.append('cosmeticId', payload.cosmeticId)

    // Append each file with the indexed name 'images[0]', 'images[1]', etc.
    payload.images.forEach((file, index) => {
      formData.append(`images[${index}]`, file)
    })

    return axiosClient.put<ApiResponse<void>>('/cosmetics/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default cosmeticApi
