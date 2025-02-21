import { createFileRoute } from '@tanstack/react-router'
import OrderTrackingPage from '@/pages/order_track/OrderTrackingPage'

export const Route = createFileRoute('/order_track')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <OrderTrackingPage />
    </>
  )
}
