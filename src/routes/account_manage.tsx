import { createFileRoute } from '@tanstack/react-router'
import AccountManagementPage from '@/pages/account_manage/AccountManagementPage'

export const Route = createFileRoute('/account_manage')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <AccountManagementPage />
    </>
  )
}
