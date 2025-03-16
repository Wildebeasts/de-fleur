import { ResetPasswordPage } from '@/pages/reset_password/ResetPasswordPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/reset_password')({
  validateSearch: (search: Record<string, unknown>) => ({
    accessToken:
      typeof search.accessToken === 'string' ? search.accessToken : '',
    email: typeof search.email === 'string' ? search.email : ''
  }),
  component: ResetPasswordPage
})
