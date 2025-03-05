import { createFileRoute } from '@tanstack/react-router'
import AdminDashboard from '@/pages/admin_dashboard/landing'
import { redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboardRoute,
  beforeLoad: ({ context }) => {
    // Add authentication check
    if (!context.isAuthenticated) {
      throw redirect({ to: '/login', search: { redirect: '/admin' } })
    }
  }
})

function AdminDashboardRoute() {
  return <AdminDashboard />
}
