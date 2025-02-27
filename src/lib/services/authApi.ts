import axiosClient from '../api/axiosClient'
import { ApiResponse } from '../types/base/Api'

interface RefreshTokenRequest {
  accessToken: string
  refreshToken: string
}

interface TokenResponse {
  accessToken: string
  refreshToken: string
}

const authApi = {
  refreshToken: (request: RefreshTokenRequest) =>
    axiosClient.post<ApiResponse<TokenResponse>>('/auth/refresh-token', request)
}

export default authApi
