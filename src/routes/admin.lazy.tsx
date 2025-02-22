import { createLazyFileRoute } from '@tanstack/react-router'
import Layout from '@/pages/@Admin/layout'

export const Route = createLazyFileRoute('/admin')({
  component: Layout
})

export default Layout
