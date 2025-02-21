import { createFileRoute } from '@tanstack/react-router'
import OrderingInstructionsPage from '@/pages/order_instruct/OrderingInstructionsPage'

export const Route = createFileRoute('/order_instruct')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <OrderingInstructionsPage />
    </>
  )
}
