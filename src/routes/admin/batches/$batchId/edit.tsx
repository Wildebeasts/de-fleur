import { createFileRoute } from '@tanstack/react-router'
import EditBatch from '@/pages/admin_dashboard/batches/batch_edit'

export const Route = createFileRoute('/admin/batches/$batchId/edit')({
  component: RouteComponent
})

function RouteComponent() {
  return <EditBatch />
}
