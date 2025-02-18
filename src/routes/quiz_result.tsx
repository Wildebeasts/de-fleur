import { createFileRoute } from '@tanstack/react-router'
import QuizResult from '@/pages/quiz/SkinProfile'
export const Route = createFileRoute('/quiz_result')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <QuizResult />
    </>
  )
}
