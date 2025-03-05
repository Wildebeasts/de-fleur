export interface CosmeticSubCategoryResponse {
  cosmeticId: string
  subCategoryId: string
  subCategory: SubCategoryResponse
}

export interface SubCategoryResponse {
  id: string
  name: string
  description: string
  categoryId: string
}
