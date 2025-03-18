import { createFileRoute } from '@tanstack/react-router'
import ResetPassword from '@/pages/ResetPassword'

export const Route = createFileRoute('/reset_password')({
  component: ResetPassword
})
