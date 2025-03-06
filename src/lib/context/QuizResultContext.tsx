import { RoutineResponse } from '@/lib/types/Routine'
import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import userApi from '../services/userService'
import routineApi from '../services/routineApi'
import quizApi from '../services/quizApi'

interface QuizResultContextType {
  quizResults: RoutineResponse[] | null
  isLoading: boolean
  setQuizResults: (results: RoutineResponse[]) => void
}

interface QuizSubmission {
  id: string
  data: {
    answers: {
      questionId: string
      selectedOptionIds: string[]
    }[]
  }
}

const QuizResultContext = createContext<QuizResultContextType | null>(null)

export const QuizResultProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [quizResults, setQuizResults] = useState<RoutineResponse[] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    // Function to fetch routines based on user profile
    const fetchQuizResults = async () => {
      if (!isAuthenticated) {
        setQuizResults(null) // Clear results for guests
        setIsLoading(false)
        return
      }

      try {
        const answerString = localStorage.getItem('quiz-answers')
        if (answerString) {
          const answers = JSON.parse(answerString!) as QuizSubmission
          const result = await quizApi.submitQuiz(answers.id, answers.data)
          console.log(result.data.data)
          localStorage.removeItem('quiz-answers')
        }

        setIsLoading(true)
        const userProfile = await userApi.getUserProfile()

        if (!userProfile.skinTypeId) throw new Error('Skin type not found')

        const routines = await routineApi.getRoutine(userProfile.skinTypeId)
        setQuizResults(routines.data.data as RoutineResponse[])
      } catch (error) {
        console.error('Failed to fetch quiz results', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuizResults()
  }, [isAuthenticated]) // Fetch data when authentication state changes

  return (
    <QuizResultContext.Provider
      value={{ quizResults, isLoading, setQuizResults }}
    >
      {children}
    </QuizResultContext.Provider>
  )
}

export const useQuizResult = () => {
  const context = useContext(QuizResultContext)
  if (!context) {
    throw new Error('useQuizResult must be used within a QuizResultProvider')
  }
  return context
}
