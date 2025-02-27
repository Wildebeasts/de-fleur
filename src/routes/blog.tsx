import { createFileRoute } from '@tanstack/react-router'
import BlogLayout from '@/pages/blog/BlogLayout'
import { BlogProvider } from '@/lib/context/BlogContext'
export const Route = createFileRoute('/blog')({
  component: BlogPage
})

function BlogPage() {
  return (
    <BlogProvider>
      <BlogLayout />
    </BlogProvider>
  )
}
