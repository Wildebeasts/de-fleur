import { createFileRoute } from '@tanstack/react-router'
import CreateCosmetic from '@/pages/admin_dashboard/Cosmetic/cosmetic_create'

export const Route = createFileRoute('/admin/cosmetics/create')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <CreateCosmetic />
    </>
  )
}
