import { createFileRoute } from '@tanstack/react-router'
import ForgotPassword from '@/pages/ForgotPassword'

export const Route = createFileRoute('/forgot_password')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <ForgotPassword />
    </>
  )
}
