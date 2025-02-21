import { createFileRoute } from '@tanstack/react-router'
import SocialAccountsPage from '@/pages/social_account/SocialAccountsPage'

export const Route = createFileRoute('/social_account')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <SocialAccountsPage />
    </>
  )
}
