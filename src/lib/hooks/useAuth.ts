import { useMutation } from '@tanstack/react-query'
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RegisterRequest
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

async function registerRequest(
  data: RegisterRequest
): Promise<ApiResponse<LoginResponse>> {
  const response = await axiosClient.post<ApiResponse<LoginResponse>>(
    '/auth/register',
    data
  )

  if (!response.data.isSuccess) {
    throw new Error(response.data.message || 'Register failed')
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

async function forgotPasswordRequest(
  email: string
): Promise<ApiResponse<null>> {
  const response = await axiosClient.post<ApiResponse<null>>(
    '/auth/forgot-password',
    { email }
  )

  if (!response.data.isSuccess) {
    throw new Error(response.data.message || 'Password reset request failed')
  }

  return response.data
}

interface ResetPasswordRequest {
  email: string
  accessToken: string
  password: string
  passwordConfirmation: string
}

async function resetPasswordRequest(
  data: ResetPasswordRequest
): Promise<ApiResponse<null>> {
  const response = await axiosClient.post<ApiResponse<null>>(
    '/auth/reset-password',
    data
  )

  if (!response.data.isSuccess) {
    throw new Error(response.data.message || 'Password reset failed')
  }

  return response.data
}

export function useLogin() {
  return useMutation({
    mutationFn: loginRequest
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: registerRequest
  })
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: refreshTokenRequest
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPasswordRequest
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: resetPasswordRequest
  })
}
