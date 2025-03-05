export interface LoginRequest {
  userName: string
  password: string
}
export interface LoginResponse {
  userName: string
  email: string
  accessToken: string
  accessTokenExpiration: number
  refreshToken: string
  refreshTokenExpiration: number
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
