import { createFileRoute } from '@tanstack/react-router'
import QuizPage from '@/pages/quiz/QuizPage'
import MobileQuizPage from '@/pages/quiz/MobileQuizPage'
import { QuizResultProvider } from '@/lib/context/QuizResultContext'
import { useIsMobile } from '@/lib/hooks/use-mobile'

export const Route = createFileRoute('/quiz')({
  component: RouteComponent
})

function RouteComponent() {
  const isMobile = useIsMobile()

  return (
    <QuizResultProvider>
      {isMobile ? <MobileQuizPage /> : <QuizPage />}
    </QuizResultProvider>
  )
}
