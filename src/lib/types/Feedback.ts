export interface FeedbackRequest {
  cosmeticId: string
  content: string | null
  rating: number
}

export interface FeedbackResponse {
  id: string
  customerId: string
  customerName: string | null
  content: string | null
  rating: number
}
