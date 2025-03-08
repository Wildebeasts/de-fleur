import { createFileRoute } from '@tanstack/react-router'
import CreateBlog from '@/pages/admin_dashboard/Blogs/blog_create'

export const Route = createFileRoute('/admin/blogs/add')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <CreateBlog />
    </>
  )
}
