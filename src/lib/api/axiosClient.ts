import axios from 'axios'
import authApi from '../services/authApi'

const axiosClient = axios.create({
  baseURL: 'https://api.pak160404.click/api', // Change to your backend URL
  // baseURL: 'https://localhost:5051/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to add token to all requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for handling token refresh
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Check if error is 401 and we haven't retried the request yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh-token' // Prevent infinite loop
    ) {
      originalRequest._retry = true

      try {
        const currentAccessToken = localStorage.getItem('accessToken')
        const currentRefreshToken = localStorage.getItem('refreshToken')

        if (!currentAccessToken || !currentRefreshToken) {
          throw new Error('No tokens available')
        }

        // Call refresh token endpoint
        const response = await authApi.refreshToken({
          accessToken: currentAccessToken,
          refreshToken: currentRefreshToken
        })

        // Save the new tokens
        if (response.data?.data) {
          localStorage.setItem('accessToken', response.data.data.accessToken)
          localStorage.setItem('refreshToken', response.data.data.refreshToken)

          // Update the authorization header
          originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`
        } else {
          throw new Error('Invalid response format from refresh token endpoint')
        }

        // Retry the original request
        return axios(originalRequest)
      } catch (refreshError) {
        // Clear tokens on refresh failure
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')

        // Redirect to login page
        window.location.href = '/login'

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosClient
