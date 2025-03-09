import { createFileRoute, Outlet, useMatches } from '@tanstack/react-router'
import AdminDashboard from '@/pages/admin_dashboard/landing'
import Layout from '@/pages/admin_dashboard/layout'
import AdminProtectedRoute from '@/components/Auth/AdminProtectedRoute'

export const Route = createFileRoute('/admin')({
  component: AdminRoute
})

function AdminRoute() {
  const matches = useMatches()
  const isExactAdminRoute =
    matches.length === 2 && matches[1].pathname === '/admin'

  return (
    <AdminProtectedRoute>
      <Layout>{isExactAdminRoute ? <AdminDashboard /> : <Outlet />}</Layout>
    </AdminProtectedRoute>
  )
}
