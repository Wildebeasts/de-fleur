import { createFileRoute } from '@tanstack/react-router'
import BrandList from '@/pages/admin_dashboard/Cosmetic/brand_list'

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
