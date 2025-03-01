import {
  createFileRoute,
  Outlet,
  redirect,
  useMatches
} from '@tanstack/react-router'
import AdminDashboard from '@/pages/admin_dashboard/landing'
import Layout from '@/pages/admin_dashboard/layout'

export const Route = createFileRoute('/admin')({
  component: AdminRoute,
  beforeLoad: ({ context }) => {
    // Add authentication check
    if (!context.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  }
})

function AdminRoute() {
  const matches = useMatches()
  const isExactAdminRoute =
    matches.length === 2 && matches[1].pathname === '/admin'

  return <Layout>{isExactAdminRoute ? <AdminDashboard /> : <Outlet />}</Layout>
}
