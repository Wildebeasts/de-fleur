import { createFileRoute } from '@tanstack/react-router'
import CreateBatch from '@/pages/admin_dashboard/batches/batch_create'

export const Route = createFileRoute('/admin/batches/create')({
  component: RouteComponent
})

function RouteComponent() {
  return <CreateBatch />
}
