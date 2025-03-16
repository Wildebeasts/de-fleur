import BatchesPage from '@/pages/admin_dashboard/batches/batch_list'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/batches/')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <BatchesPage />
    </>
  )
}
