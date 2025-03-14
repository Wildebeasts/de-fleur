/* eslint-disable @typescript-eslint/no-explicit-any */
import { CosmeticSubCategoryResponse } from './SubCategory'

export enum VolumeUnit {
  ML = 'ml',
  G = 'g'
  // Add other units as needed
}

export interface CosmeticImageCosmeticResponse {
  id: string
  imageUrl: string
  cosmetic?: any | null
}

export interface BatchResponse {
  id: string
  cosmeticId: string
  quantity: number
  exportedDate: string
  manufactureDate: string
  expirationDate: string
}

export interface FeedbackCosmeticResponse {
  id: string
  rating: number
  content: string | null
  customer: any | null
}

export interface CosmeticResponse {
  id: string
  createAt: string
  createdBy: string | null
  lastModified: string | null
  lastModifiedBy: string | null
  isActive: boolean
  brandId: string
  //brand: BrandResponse | null
  skinTypeId: string
  //skinType: SkinTypeResponse | null
  cosmeticTypeId: string
  //cosmeticType: CosmeticTypeResponse | null
  name: string
  originalPrice: number
  price: number
  gender: boolean
  notice: string
  ingredients: string
  mainUsage: string
  texture: string
  origin: string
  instructions: string
  weight: number
  length: number
  width: number
  height: number
  thumbnailUrl: string | null
  volumeUnit: VolumeUnit
  cosmeticSubcategories: CosmeticSubCategoryResponse[]
  cosmeticImages: CosmeticImageCosmeticResponse[]
  //batches: BatchResponse[]
  feedbacks: FeedbackCosmeticResponse[]
  quantity: number
  rating: number | null
}
