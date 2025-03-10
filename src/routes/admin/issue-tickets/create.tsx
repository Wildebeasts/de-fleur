import { createFileRoute } from '@tanstack/react-router'
import CreateReport from '@/pages/admin_dashboard/Reports/report_create'

export const Route = createFileRoute('/admin/issue-tickets/create')({
  component: CreateReportRoute
})

function CreateReportRoute() {
  return <CreateReport />
}
