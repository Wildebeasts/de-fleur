import { createFileRoute } from '@tanstack/react-router'
import OrderTrackingPage from '@/pages/order_track/OrderTrackingPage'

export const Route = createFileRoute('/order_track')({
  component: OrderTrackingPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      orderId: search.orderId as string | undefined
    }
  }
})
