import { createFileRoute } from '@tanstack/react-router'
import StaffShop from '@/pages/staff_dashboard/StaffShop'

export const Route = createFileRoute('/staff/')({
  component: StaffDashboard
})

function StaffDashboard() {
  return <StaffShop />
}
