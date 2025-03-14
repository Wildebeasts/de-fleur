export interface BatchResponse {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface Batch {
  id: string
  cosmeticId: string
  quantity: number
  exportedDate: string
  manufactureDate: string
  expirationDate: string
}

export interface BatchesApiResponse {
  isSuccess: boolean
  data: Batch[]
  message: string
  errors: string[]
}
