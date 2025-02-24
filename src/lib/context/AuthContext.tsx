import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  ReactNode
} from 'react'
import { useLogin, useRefreshToken } from '../hooks/useAuth'
import type { LoginRequest } from '../types/auth'

interface AuthContextType {
  isAuthenticated: boolean
  accessToken: string | null
  login: (data: LoginRequest) => Promise<void>
  logout: () => void
  isLoading: boolean
  error: Error | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('accessToken')
  )
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem('refreshToken')
  )
  const [error, setError] = useState<Error | null>(null)

  const loginMutation = useLogin()
  const refreshTokenMutation = useRefreshToken()

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setAccessToken(null)
    setRefreshToken(null)
  }, [])

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) return

    try {
      const response = await refreshTokenMutation.mutateAsync({ refreshToken })
      if (response.isSuccess && response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken)
        localStorage.setItem('refreshToken', response.data.refreshToken || '')
        setAccessToken(response.data.accessToken)
        setRefreshToken(response.data.refreshToken)
      } else {
        logout()
      }
    } catch (err) {
      logout()
    }
  }, [refreshToken, refreshTokenMutation, logout])

  useEffect(() => {
    if (!accessToken || !refreshToken) return

    const refreshInterval = 1000 * 60 * 55 // 55 minutes
    const intervalId = setInterval(refreshAccessToken, refreshInterval)

    return () => clearInterval(intervalId)
  }, [accessToken, refreshToken, refreshAccessToken])

  const login = useCallback(
    async (data: LoginRequest) => {
      try {
        setError(null)
        const response = await loginMutation.mutateAsync(data)

        if (response.isSuccess && response.data.accessToken) {
          localStorage.setItem('accessToken', response.data.accessToken)
          localStorage.setItem('refreshToken', response.data.refreshToken || '')
          setAccessToken(response.data.accessToken)
          setRefreshToken(response.data.refreshToken)
        } else {
          throw new Error(response.message || 'Login failed')
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Login failed'))
        throw err
      }
    },
    [loginMutation]
  )

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!accessToken,
        accessToken,
        login,
        logout,
        isLoading: loginMutation.isPending || refreshTokenMutation.isPending,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
