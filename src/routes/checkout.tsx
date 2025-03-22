import { createFileRoute } from '@tanstack/react-router'
import CheckoutPage from '@/pages/checkout/CheckoutPage'
import { useIsMobile } from '@/hooks/use-mobile'
import MobileCheckoutPage from '@/pages/checkout/MobileCheckoutPage'

export const Route = createFileRoute('/checkout')({
  component: RouteComponent
})

function RouteComponent() {
  const isMobile = useIsMobile()

  return <>{isMobile ? <MobileCheckoutPage /> : <CheckoutPage />}</>
}
