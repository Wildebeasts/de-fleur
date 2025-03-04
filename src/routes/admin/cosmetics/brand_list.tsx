import { createFileRoute } from '@tanstack/react-router'
import BrandList from '@/pages/admin_dashboard/Courses/Course/brand_list'

export const Route = createFileRoute('/admin/cosmetics/brand_list')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <BrandList />
    </>
  )
}
