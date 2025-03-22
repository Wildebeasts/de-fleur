import { createFileRoute } from '@tanstack/react-router'
import OrderHistoryPage from '@/pages/order_history/OrderHistoryPage'
import MobileOrderHistoryPage from '@/pages/order_history/MobileOrderHistoryPage'
import { useIsMobile } from '@/hooks/use-mobile'

export const Route = createFileRoute('/order_history')({
  component: RouteComponent
})

function RouteComponent() {
  const isMobile = useIsMobile()

  return <>{isMobile ? <MobileOrderHistoryPage /> : <OrderHistoryPage />}</>
}
