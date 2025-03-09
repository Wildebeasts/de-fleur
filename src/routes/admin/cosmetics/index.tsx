import { createFileRoute } from '@tanstack/react-router'
import Cosmetics from '@/pages/admin_dashboard/Cosmetic/cosmetic_list'

export const Route = createFileRoute('/admin/cosmetics/')({
  component: RouteComponent
})

function RouteComponent() {
  return <Cosmetics />
}
