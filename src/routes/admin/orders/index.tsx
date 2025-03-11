import { createFileRoute } from '@tanstack/react-router'
import OrderList from '@/pages/admin_dashboard/Orders/order_list'

export const Route = createFileRoute('/admin/orders/')({
  component: OrderListRoute
})

function OrderListRoute() {
  return <OrderList />
}
