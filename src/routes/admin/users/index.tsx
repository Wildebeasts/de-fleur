import { createFileRoute } from '@tanstack/react-router'
import Users from '@/pages/admin_dashboard/Users/User/user_list'

export const Route = createFileRoute('/admin/users/')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <Users />
    </>
  )
}
