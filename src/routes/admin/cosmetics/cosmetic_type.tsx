import { createFileRoute } from '@tanstack/react-router'
import CosmeticTypeList from '@/pages/admin_dashboard/Cosmetic/cosmetic_type_list'

export const Route = createFileRoute('/admin/cosmetics/cosmetic_type')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <CosmeticTypeList />
    </>
  )
}
