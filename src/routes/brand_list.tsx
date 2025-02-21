import { createFileRoute } from '@tanstack/react-router'
import BrandListPage from '../pages/brand_list/BrandListPage'
export const Route = createFileRoute('/brand_list')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <BrandListPage />
    </>
  )
}
