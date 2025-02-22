import { createFileRoute } from '@tanstack/react-router'
import Landing from '@/pages/@Admin/landing'

export const Route = createFileRoute('/admin')({
  component: Landing
})
