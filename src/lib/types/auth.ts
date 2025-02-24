export interface LoginRequest {
  userName: string
  password: string
}

export interface LoginResponse {
  isSuccess: boolean
  data: {
    userName: string | null
    email: string | null
    accessToken: string | null
    accessTokenExpiration: number
    refreshToken: string | null
    refreshTokenExpiration: number
  }
  message: string | null
  errors: Array<{
    code: string | null
    description: string | null
  }>
}

export interface RegisterRequest {
  userName: string
  password: string
  email: string
  fullName: string
  phoneNumber: string
}

export interface ResetPasswordRequest {
  email: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface AuthError {
  message: string
  statusCode: number
}
