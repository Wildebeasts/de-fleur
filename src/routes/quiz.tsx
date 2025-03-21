import { createFileRoute } from '@tanstack/react-router'
import QuizPage from '@/pages/quiz/QuizPage'
import { QuizResultProvider } from '@/lib/context/QuizResultContext'

export const Route = createFileRoute('/quiz')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <QuizResultProvider>
      <QuizPage />
    </QuizResultProvider>
  )
}
