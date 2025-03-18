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
  passwordConfirmation: string
  gender: boolean
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
}

export interface ResetPasswordRequest {
  accessToken: string
  email: string
  password: string
  passwordConfirmation: string
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
