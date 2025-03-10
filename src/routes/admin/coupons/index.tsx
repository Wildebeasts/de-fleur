import { createFileRoute } from '@tanstack/react-router'
import CouponList from '@/pages/admin_dashboard/Coupons/coupon_list'

export const Route = createFileRoute('/admin/coupons/')({
  component: CouponListRoute
})

function CouponListRoute() {
  return <CouponList />
}
