import { createFileRoute } from '@tanstack/react-router'
import AdminDashboard from '@/pages/admin_dashboard/landing'
import { redirect } from '@tanstack/react-router'

//@ts-expect-error - expected error
export const Route = createFileRoute('/admin/')({
  component: AdminDashboardRoute,
  beforeLoad: ({ context }) => {
    // Add authentication check
    if (!context.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  }
})

function AdminDashboardRoute() {
  return <AdminDashboard />
}
