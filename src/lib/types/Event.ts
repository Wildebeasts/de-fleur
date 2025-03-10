export interface EventResponse {
  name: string
  description: string
  discountPercentage: number
  isActive: boolean
}

export interface EventCreateRequest {
  name: string
  description: string
  discountPercentage: number
}
