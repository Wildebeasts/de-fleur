import { RoutineResponse } from '@/types/Routine'
import { createContext, useContext, useState } from 'react'

interface QuizResultContextType {
  quizResults: RoutineResponse[] | null
  setQuizResults: (results: RoutineResponse[]) => void
}

const QuizResultContext = createContext<QuizResultContextType | null>(null)

export const QuizResultProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [quizResults, setQuizResults] = useState<RoutineResponse[] | null>(null)

  return (
    <QuizResultContext.Provider value={{ quizResults, setQuizResults }}>
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
