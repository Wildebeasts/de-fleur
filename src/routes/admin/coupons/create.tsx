import { createFileRoute } from '@tanstack/react-router'
import CreateCoupon from '@/pages/admin_dashboard/Coupons/coupon_create'

export const Route = createFileRoute('/admin/coupons/create')({
  component: CreateCouponRoute
})

function CreateCouponRoute() {
  return <CreateCoupon />
}
