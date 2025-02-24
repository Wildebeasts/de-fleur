import { useMutation } from '@tanstack/react-query'
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest
} from '../types/auth'

const API_URL = 'https://api.pak160404.click'

async function loginRequest(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error('Login failed')
  }

  return response.json()
}

async function refreshTokenRequest(
  data: RefreshTokenRequest
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error('Token refresh failed')
  }

  return response.json()
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
