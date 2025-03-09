import { useAuth } from '@/lib/context/AuthContext'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

interface StaffProtectedRouteProps {
  children: React.ReactNode
}

interface JwtPayload {
  roles: string | string[]
  [key: string]: unknown
}

const StaffProtectedRoute: React.FC<StaffProtectedRouteProps> = ({
  children
}) => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isStaff, setIsStaff] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login', search: { redirect: '/staff' } })
      return
    }

    // Get token and check roles
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      try {
        const decoded = jwtDecode<JwtPayload>(accessToken)

        // Check if roles is a string or array
        const roles = Array.isArray(decoded.roles)
          ? decoded.roles
          : [decoded.roles]

        // Check if user has staff role
        const hasStaffRole = roles.some(
          (role: string) =>
            role === 'Staff' || role === 'Manager' || role === 'Administrator'
        )

        setIsStaff(hasStaffRole)

        if (!hasStaffRole) {
          navigate({ to: '/' })
        }
      } catch (error) {
        console.error('Error decoding JWT:', error)
        navigate({ to: '/login', search: { redirect: '/staff' } })
      }
    } else {
      navigate({ to: '/login', search: { redirect: '/staff' } })
    }
  }, [isAuthenticated, navigate])

  // Only render children if authenticated and is staff
  return isAuthenticated && isStaff ? <>{children}</> : null
}

export default StaffProtectedRoute
