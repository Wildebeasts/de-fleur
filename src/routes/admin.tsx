import { createFileRoute, Outlet, useMatches } from '@tanstack/react-router'
import AdminDashboard from '@/pages/admin_dashboard/landing'
import Layout from '@/pages/admin_dashboard/layout'
import { useAuth } from '@/lib/context/AuthContext'
import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/admin')({
  component: AdminRoute
})

function AdminRoute() {
  const matches = useMatches()
  const isExactAdminRoute =
    matches.length === 2 && matches[1].pathname === '/admin'
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if we're authenticated
    if (!isAuthenticated) {
      navigate({ to: '/login', search: { redirect: '/admin' } })
    }
  }, [isAuthenticated, navigate])

  return <Layout>{isExactAdminRoute ? <AdminDashboard /> : <Outlet />}</Layout>
}
