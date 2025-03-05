import {
  createFileRoute,
  Outlet,
  redirect,
  useMatches,
  useNavigate
} from '@tanstack/react-router'
import AdminDashboard from '@/pages/admin_dashboard/landing'
import Layout from '@/pages/admin_dashboard/layout'
import { useAuth } from '@/lib/context/AuthContext'
import { useEffect } from 'react'

export const Route = createFileRoute('/admin')({
  component: AdminRoute,
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: '/admin'
        }
      })
    }
  }
})

function AdminRoute() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const matches = useMatches()
  const isExactAdminRoute =
    matches.length === 2 && matches[1].pathname === '/admin'

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login', search: { redirect: '/admin' } })
    }
  }, [isAuthenticated, navigate])

  return <Layout>{isExactAdminRoute ? <AdminDashboard /> : <Outlet />}</Layout>
}
