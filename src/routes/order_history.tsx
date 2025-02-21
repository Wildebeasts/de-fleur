import { createFileRoute } from '@tanstack/react-router'
import OrderHistoryPage from '@/pages/order_history/OrderHistoryPage'

export const Route = createFileRoute('/order_history')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <OrderHistoryPage />
    </>
  )
}
