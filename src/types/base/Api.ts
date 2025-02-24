import { ErrorResponse } from './Error'

export interface ApiResponse<T> {
  isSuccess: boolean
  data?: T
  message?: string
  errors?: ErrorResponse[]
}
