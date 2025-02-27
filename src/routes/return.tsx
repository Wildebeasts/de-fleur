import PaymentReturn from '@/pages/payment/PaymentReturn'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/return')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <PaymentReturn />
    </>
  )
}
