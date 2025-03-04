import { createFileRoute } from '@tanstack/react-router'
import SkinTypeList from '@/pages/admin_dashboard/Courses/Course/skin_type_list'
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
