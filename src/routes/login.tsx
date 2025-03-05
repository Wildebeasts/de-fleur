import { createFileRoute } from '@tanstack/react-router'
import { LoginPage } from '@/pages/login/LoginPage'

export const Route = createFileRoute('/login')({
  validateSearch: (search) => ({
    redirect: search.redirect
  }),
  component: LoginPage
})
