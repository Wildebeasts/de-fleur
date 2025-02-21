import { createFileRoute } from '@tanstack/react-router'
import TestimonialsPage from '@/pages/testimonials/TestimonialsPage'
export const Route = createFileRoute('/testimonials')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <TestimonialsPage />
    </>
  )
}
