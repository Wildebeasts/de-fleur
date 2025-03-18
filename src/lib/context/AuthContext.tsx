import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  useForgotPassword,
  useLogin,
  useRegister,
  useResetPassword
} from '../hooks/useAuth'
import {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest
} from '../types/auth'
import { ApiResponse, LoginApiResponse } from '../types/base/Api'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  roles: string | string[]
  [key: string]: unknown
}

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  user: LoginResponse | null
  login: (credentials: LoginRequest) => Promise<LoginApiResponse>
  register: (creadentials: RegisterRequest) => Promise<LoginApiResponse>
  forgotPassword: (
    credentials: ForgotPasswordRequest
  ) => Promise<ApiResponse<null>>
  resetPassword: (
    creadentials: ResetPasswordRequest
  ) => Promise<ApiResponse<null>>
  logout: () => void
  redirectBasedOnRole: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const loginMutation = useLogin()
  const registerMutation = useRegister()
  const forgotMutation = useForgotPassword()
  const resetMutation = useResetPassword()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')

    if (storedUser && (accessToken || refreshToken)) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }

    setIsInitialized(true)
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      const response: LoginApiResponse =
        await loginMutation.mutateAsync(credentials)
      console.log('Login response:', response) // Debug log

      // Store tokens
      if (response.data) {
        localStorage.setItem('accessToken', response.data.accessToken)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        localStorage.setItem('user', JSON.stringify(response.data))
        setUser(response.data as LoginResponse)
        setIsAuthenticated(true)
      } else {
        throw new Error('Invalid token data received')
      }

      return response // Return the response for the component to use
    } catch (error) {
      console.error('Login error:', error) // Debug log
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      setUser(null)
      setIsAuthenticated(false)
      throw error
    }
  }

  const register = async (credentials: RegisterRequest) => {
    try {
      const response: LoginApiResponse =
        await registerMutation.mutateAsync(credentials)
      console.log('Register response:', response) // Debug log

      return response // Return the response for the component to use
    } catch (error) {
      console.error('Register error:', error) // Debug log
      throw error
    }
  }

  const forgotPassword = async (credentials: ForgotPasswordRequest) => {
    try {
      const response: ApiResponse<null> = await forgotMutation.mutateAsync(
        credentials.email
      )
      console.log('Forgot password response:', response) // Debug log

      return response // Return the response for the component to use
    } catch (error) {
      console.error('Forgot password error:', error) // Debug log
      throw error
    }
  }

  const resetPassword = async (credentials: ResetPasswordRequest) => {
    try {
      const response: ApiResponse<null> =
        await resetMutation.mutateAsync(credentials)
      console.log('Reset password response:', response) // Debug log

      return response // Return the response for the component to use
    } catch (error) {
      console.error('Reset password error:', error) // Debug log
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
  }

  const redirectBasedOnRole = () => {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) return null

    try {
      const decoded = jwtDecode<JwtPayload>(accessToken)

      // Convert roles to array if it's a string
      const roles = Array.isArray(decoded.roles)
        ? decoded.roles
        : [decoded.roles]

      // Check for admin roles
      const hasAdminRole = roles.some(
        (role) =>
          role === 'Admin' || role === 'Administrator' || role === 'Manager'
      )

      if (hasAdminRole) {
        return '/admin'
      }

      // Check for staff roles
      const hasStaffRole = roles.some(
        (role) =>
          role === 'Staff' || role === 'Manager' || role === 'Administrator'
      )

      if (hasStaffRole) {
        return '/staff'
      }

      // Default redirect for authenticated users with no special roles
      return '/'
    } catch (error) {
      console.error('Error decoding JWT:', error)
      return '/'
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading: loginMutation.isPending,
        isInitialized,
        user,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
        redirectBasedOnRole
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
