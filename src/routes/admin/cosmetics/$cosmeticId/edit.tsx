import { createFileRoute } from '@tanstack/react-router'
import EditCosmetic from '@/pages/admin_dashboard/Cosmetic/cosmetic_edit'

export const Route = createFileRoute('/admin/cosmetics/$cosmeticId/edit')({
  component: RouteComponent
})

function RouteComponent() {
  return <EditCosmetic />
}
