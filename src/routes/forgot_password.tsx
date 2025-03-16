import { createFileRoute } from '@tanstack/react-router'
import { ForgotPasswordPage } from '@/pages/forgot_password/ForgotPasswordPage'

export const Route = createFileRoute('/forgot_password')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <ForgotPasswordPage />
    </>
  )
}
