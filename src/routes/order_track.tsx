import { createFileRoute } from '@tanstack/react-router'
import OrderTrackingPage from '@/pages/order_track/OrderTrackingPage'
import MobileOrderTrackingPage from '@/pages/order_track/MobileOrderTrackingPage'
import { useIsMobile } from '@/lib/hooks/use-mobile'

// Create a wrapper component that switches between mobile and desktop versions
function OrderTrackingRouteComponent() {
  const isMobile = useIsMobile()

  return <>{isMobile ? <MobileOrderTrackingPage /> : <OrderTrackingPage />}</>
}

export const Route = createFileRoute('/order_track')({
  component: OrderTrackingRouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      orderId: search.orderId as string | undefined
    }
  }
})
