import { createFileRoute } from '@tanstack/react-router'
import Cosmetics from '@/pages/admin_dashboard/Courses/Course/course_list'

export const Route = createFileRoute('/admin/cosmetics/')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <Cosmetics />
    </>
  )
}
