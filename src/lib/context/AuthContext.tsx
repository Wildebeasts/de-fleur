import React, { createContext, useContext, useState, useEffect } from 'react'
import { useLogin, useRegister } from '../hooks/useAuth'
import { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth'
import { LoginApiResponse } from '../types/base/Api'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  user: LoginResponse | null
  login: (credentials: LoginRequest) => Promise<LoginApiResponse>
  register: (creadentials: RegisterRequest) => Promise<LoginApiResponse>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const loginMutation = useLogin()
  const registerMutation = useRegister()

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

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
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
        logout
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
