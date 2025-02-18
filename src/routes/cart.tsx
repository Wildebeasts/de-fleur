import { createFileRoute } from '@tanstack/react-router'
import CartLayout from '@/pages/cart/ShoppingCartPage'
export const Route = createFileRoute('/cart')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <CartLayout />
    </>
  )
}
