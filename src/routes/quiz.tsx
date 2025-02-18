import { createFileRoute } from '@tanstack/react-router'
import QuizPage from '@/pages/quiz/QuizPage'

export const Route = createFileRoute('/quiz')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <QuizPage />
    </>
  )
}
