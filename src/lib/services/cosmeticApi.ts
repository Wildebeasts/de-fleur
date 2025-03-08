import { ApiResponse } from '@/lib/types/base/Api'
import { CosmeticResponse } from '@/lib/types/Cosmetic'
import { PaginatedList } from '@/lib/types/common/PaginatedList'
import axiosClient from '../api/axiosClient'

interface ImageUploadPayload {
  cosmeticId: string
  images: string[] // Array of base64 strings
}

const cosmeticApi = {
  getCosmetics: (
    pageIndex = 1,
    pageSize = 12,
    sortColumn = 'name',
    sortOrder = 'asc',
    name?: string,
    brandId?: string,
    skinTypeId?: string,
    cosmeticTypeId?: string,
    gender?: boolean,
    minPrice?: number,
    maxPrice?: number
  ) => {
    let url = `/cosmetics?pageIndex=${pageIndex}&pageSize=${pageSize}`

    if (sortColumn) url += `&sortColumn=${sortColumn}`
    if (sortOrder) url += `&sortOrder=${sortOrder}`
    if (name) url += `&name=${encodeURIComponent(name)}`
    if (brandId) url += `&brandId=${brandId}`
    if (skinTypeId) url += `&skinTypeId=${skinTypeId}`
    if (cosmeticTypeId) url += `&cosmeticTypeId=${cosmeticTypeId}`
    if (gender !== undefined) url += `&gender=${gender}`
    if (minPrice !== undefined) url += `&minPrice=${minPrice}`
    if (maxPrice !== undefined) url += `&maxPrice=${maxPrice}`

    return axiosClient.get<ApiResponse<PaginatedList<CosmeticResponse>>>(url)
  },
  getCosmeticById: (id: string) =>
    axiosClient.get<ApiResponse<CosmeticResponse>>(`/cosmetics/${id}`),
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
