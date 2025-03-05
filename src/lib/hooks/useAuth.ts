import { useMutation } from '@tanstack/react-query'
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest
} from '../types/auth'
import axiosClient from '../api/axiosClient'
import { ApiResponse } from '../types/base/Api'

// const API_URL = 'https://api.pak160404.click'

async function loginRequest(
  data: LoginRequest
): Promise<ApiResponse<LoginResponse>> {
  const response = await axiosClient.post<ApiResponse<LoginResponse>>(
    '/auth/login',
    data
  )

  if (!response.data.isSuccess) {
    throw new Error(response.data.message || 'Login failed')
  }

  return response.data
}

async function refreshTokenRequest(
  data: RefreshTokenRequest
): Promise<ApiResponse<LoginResponse>> {
  const response = await axiosClient.post<ApiResponse<LoginResponse>>(
    '/auth/refresh-token',
    data
  )

  if (!response.data.isSuccess || !response.data.data) {
    throw new Error(response.data.message || 'Token refresh failed')
  }

  return response.data
}

export function useLogin() {
  return useMutation({
    mutationFn: loginRequest
  })
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: refreshTokenRequest
  })
}
