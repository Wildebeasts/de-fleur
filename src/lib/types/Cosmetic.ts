export interface CosmeticResponse {
  id: string
  createAt: string
  createdBy: string
  lastModified: string
  lastModifiedBy: string
  isActive: boolean
  brandId: string
  brand: string | null
  skinTypeId: string
  skinType: string | null
  cosmeticTypeId: string
  cosmeticType: string | null
  name: string
  price: number
  gender: boolean
  notice: string
  ingredients: string
  mainUsage: string
  texture: string
  origin: string
  instructions: string
  cosmeticSubcategories: string[]
  cosmeticImages: string[]
  feedbacks: string[]
}
