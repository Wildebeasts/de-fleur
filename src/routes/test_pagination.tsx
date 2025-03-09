import { createFileRoute } from '@tanstack/react-router'
import Pagination from '@/components/Store/Pagination'
export const Route = createFileRoute('/test_pagination')({
  component: RouteComponent
})

function RouteComponent() {
  return <Pagination currentPage={1} totalPages={10} onPageChange={() => { }} />
}
