import { createFileRoute } from '@tanstack/react-router'
import BlogList from '@/pages/admin_dashboard/Blogs/blog_list'

export const Route = createFileRoute('/admin/blogs/')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <BlogList />
    </>
  )
}
