import CreateReport from '@/pages/admin_dashboard/Reports/report_create'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/reports/')({
  component: RouteComponent
})

function RouteComponent() {
  return <CreateReport />
}
