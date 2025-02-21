import { createFileRoute } from '@tanstack/react-router'
import FeedbackPage from '@/pages/feedback/FeedbackPage'
export const Route = createFileRoute('/feedback')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <FeedbackPage />
    </>
  )
}
