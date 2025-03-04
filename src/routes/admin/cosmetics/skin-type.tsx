import { createFileRoute } from '@tanstack/react-router'
import SkinTypeList from '@/pages/admin_dashboard/Cosmetic/skin_type_list'
export const Route = createFileRoute('/admin/cosmetics/skin-type')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <SkinTypeList />
    </>
  )
}
