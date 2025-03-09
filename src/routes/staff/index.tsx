import { createFileRoute } from '@tanstack/react-router'
import StaffShop from '@/pages/staff_dashboard/StaffShop'
import StaffProtectedRoute from '@/components/Auth/StaffProtectedRoute'

export const Route = createFileRoute('/staff/')({
  component: StaffDashboard
})

function StaffDashboard() {
  return (
    <StaffProtectedRoute>
      <StaffShop />
    </StaffProtectedRoute>
  )
}
