import { useAuth } from '@/lib/context/AuthContext'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

interface AdminProtectedRouteProps {
  children: React.ReactNode
}

interface JwtPayload {
  roles: string | string[]
  [key: string]: unknown
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children
}) => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login', search: { redirect: '/admin' } })
      return
    }

    // Get token and check roles
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      try {
        const decoded = jwtDecode<JwtPayload>(accessToken)
        console.log('After jwtDecode', decoded)
        // Check if roles is a string or array
        const roles = Array.isArray(decoded.roles)
          ? decoded.roles
          : [decoded.roles]

        // Check if user has admin role
        const hasAdminRole = roles.some(
          (role: string) =>
            role === 'Admin' || role === 'Administrator' || role === 'Manager'
        )

        setIsAdmin(hasAdminRole)

        if (!hasAdminRole) {
          navigate({ to: '/' })
        }
      } catch (error) {
        console.error('Error decoding JWT:', error)
        navigate({ to: '/login', search: { redirect: '/admin' } })
      }
    } else {
      navigate({ to: '/login', search: { redirect: '/admin' } })
    }
  }, [isAuthenticated, navigate])

  // Only render children if authenticated and is admin
  return isAuthenticated && isAdmin ? <>{children}</> : null
}

export default AdminProtectedRoute
