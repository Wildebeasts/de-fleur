import { createFileRoute } from '@tanstack/react-router'
import EditCoupon from '@/pages/admin_dashboard/Coupons/coupon_edit'

export const Route = createFileRoute('/admin/coupons/edit/$id')({
  component: EditCouponRoute
})

function EditCouponRoute() {
  return <EditCoupon />
}
