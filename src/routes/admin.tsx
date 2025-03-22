import { createFileRoute, Outlet, useMatches } from '@tanstack/react-router'
import Layout from '@/pages/admin_dashboard/layout'
import AdminProtectedRoute from '@/components/Auth/AdminProtectedRoute'

function AdminRoute() {
  return (
    <AdminProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </AdminProtectedRoute>
  )
}

export const Route = createFileRoute('/admin')({
  component: AdminRoute
})
