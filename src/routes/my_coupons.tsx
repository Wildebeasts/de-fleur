import MyCoupons from '@/pages/my_coupons'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/my_coupons')({
  component: RouteComponent
})

function RouteComponent() {
  return <MyCoupons />
}
