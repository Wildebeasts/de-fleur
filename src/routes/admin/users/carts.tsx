import { createFileRoute } from '@tanstack/react-router'
import CartList from '@/pages/admin_dashboard/Users/User-cart/cart_list'
export const Route = createFileRoute('/admin/users/carts')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <CartList />
    </>
  )
}
