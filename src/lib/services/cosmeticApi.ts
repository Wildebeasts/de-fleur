/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiResponse } from '@/lib/types/base/Api'
import { CosmeticResponse } from '@/lib/types/Cosmetic'
import { PaginatedList } from '@/lib/types/common/PaginatedList'
import axiosClient from '../api/axiosClient'

interface CreateCosmeticPayload {
  brandId: string
  skinTypeId: string
  cosmeticTypeId: string
  name: string
  price: number
  gender: boolean
  notice?: string | null
  ingredients: string
  mainUsage: string
  texture?: string | null
  origin: string
  instructions: string
  size: number
  volumeUnit: number
  thumbnail?: File | null
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
  uploadCosmeticImages: (payload: { cosmeticId: string; images: File[] }) => {
    const formData = new FormData()
    formData.append('cosmeticId', payload.cosmeticId)

    // Append each file with the indexed name 'images[0]', 'images[1]', etc.
    payload.images.forEach((file, index) => {
      formData.append(`images[${index}]`, file)
    })

    return axiosClient.post<ApiResponse<void>>(
      `/cosmetics/${payload.cosmeticId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  },
  createCosmetic: (payload: CreateCosmeticPayload) => {
    const formData = new FormData()

    console.log('Creating FormData for cosmetic...')

    // Add all text fields to the FormData
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined && key !== 'thumbnail') {
        formData.append(key, value.toString())
        console.log(`Added ${key}:`, value)
      }
    })

    // Add thumbnail if it exists
    if (payload.thumbnail) {
      formData.append('thumbnail', payload.thumbnail)
      console.log('Added thumbnail file:', payload.thumbnail.name)
    } else {
      console.log('No thumbnail file provided')
    }

    console.log('Sending FormData to API...')

    return axiosClient.post<ApiResponse<CosmeticResponse>>(
      '/cosmetics',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  },
  updateCosmetic: (
    id: string,
    payload: { price?: number; mainUsage?: string; instructions?: string }
  ) => {
    // The API only accepts these three fields for updates
    return axiosClient.put<ApiResponse<CosmeticResponse>>(
      `/cosmetics/${id}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

export default cosmeticApi
