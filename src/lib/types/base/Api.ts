import { ErrorResponse } from './Error'
import { LoginResponse } from '@/lib/types/auth'

export interface ApiResponse<T> {
  isSuccess: boolean
  data?: T
  message?: string
  errors?: ErrorResponse[]
}

export type LoginApiResponse = ApiResponse<LoginResponse>
