import { useIsMobile } from '@/hooks/use-mobile'
import MyCoupons from '@/pages/my_coupons'
import { createFileRoute } from '@tanstack/react-router'
import MobileMyCouponsPage from '@/pages/coupon/MobileCouponPage'

export const Route = createFileRoute('/my_coupons')({
  component: RouteComponent
})

function RouteComponent() {
  const isMobile = useIsMobile()

  return <>{isMobile ? <MobileMyCouponsPage /> : <MyCoupons />}</>
}
