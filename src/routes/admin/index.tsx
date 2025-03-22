import { createFileRoute } from '@tanstack/react-router'
import AdminDashboard from '@/pages/admin_dashboard/landing'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboardRoute
})
function AdminDashboardRoute() {
  return <AdminDashboard />
}
