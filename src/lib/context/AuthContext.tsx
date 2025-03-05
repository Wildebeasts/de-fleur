import React, { createContext, useContext, useState } from 'react'
import { useLogin } from '../hooks/useAuth'
import { LoginRequest, LoginResponse } from '../types/auth'
import { LoginApiResponse } from '../types/base/Api'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: LoginResponse | null
  login: (credentials: LoginRequest) => Promise<LoginApiResponse>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const loginMutation = useLogin()

  const login = async (credentials: LoginRequest) => {
    try {
      const response: LoginApiResponse =
        await loginMutation.mutateAsync(credentials)
      console.log('Login response:', response) // Debug log

      // Store tokens
      if (response.data) {
        localStorage.setItem('accessToken', response.data.accessToken)
        localStorage.setItem('refreshToken', response.data.refreshToken)
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
      setUser(null)
      setIsAuthenticated(false)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading: loginMutation.isPending,
        user,
        login,
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
