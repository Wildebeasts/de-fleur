import { createFileRoute } from '@tanstack/react-router'
import BlogLayout from '@/pages/blog/BlogLayout'
export const Route = createFileRoute('/blog')({
  component: BlogPage
})

function BlogPage() {
  return (
    <>
      <BlogLayout />
    </>
  )
}
