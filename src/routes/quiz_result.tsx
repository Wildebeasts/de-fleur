import { createFileRoute } from '@tanstack/react-router'
import QuizResult from '@/pages/quiz/SkinProfile'
import { QuizResultProvider } from '@/lib/context/QuizResultContext'

export const Route = createFileRoute('/quiz_result')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <QuizResultProvider>
      <QuizResult />
    </QuizResultProvider>
  )
}
