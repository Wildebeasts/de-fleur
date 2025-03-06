import React, { useState } from 'react'
import Stepper, { Step } from '@/components/Stepper'
import { motion } from 'framer-motion'
import {
  MultiStepLoader,
  quizCompletionStates
} from '@/components/ui/multi-step-loader'
import { useNavigate } from '@tanstack/react-router'
import { QuestionResponse } from '@/lib/types/Question'
import { useQuizResult } from '@/lib/context/QuizResultContext'
import { useGetQuiz, useSubmitQuiz } from '@/lib/hooks/useQuiz'
import { Loader2 } from 'lucide-react'

interface QuizSubmission {
  id: string
  data: {
    answers: {
      questionId: string
      selectedOptionIds: string[]
    }[]
  }
}

const QuizPage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string[]
  }>({})
  const [processingResults, setProcessingResults] = useState(false)
  const { setQuizResults } = useQuizResult()

  // Use the query hook
  const {
    data: quiz,
    isLoading: isQuizLoading,
    error: quizError
  } = useGetQuiz()

  // Use the mutation hook
  const { mutate: submitQuiz } = useSubmitQuiz()

  const handleSubmitQuiz = () => {
    if (!quiz) return

    // Set processing results first to show the loader
    setProcessingResults(true)

    // Prepare the answers
    const answers = Object.entries(selectedAnswers).map(
      ([questionId, selectedOptionIds]) => ({
        questionId,
        selectedOptionIds
      })
    )

    const submission = { id: quiz.id, data: { answers } } as QuizSubmission
    localStorage.setItem('quiz-answers', JSON.stringify(submission))

    // Delay the actual submission to give the loader time to render
    setTimeout(() => {
      submitQuiz(
        {
          id: quiz.id,
          data: { answers }
        },
        {
          onSuccess: (data) => {
            setQuizResults(data)
            // Add a longer delay before navigation
            setTimeout(() => {
              setProcessingResults(false)
              navigate({ to: '/quiz_result' })
            }, 7500)
          },
          onError: () => {
            setProcessingResults(false)
          }
        }
      )
    }, 100) // Small delay to ensure the loader renders first
  }

  if (isQuizLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#3A4D39]" />
        <span className="ml-2 text-lg text-[#3A4D39]">Loading quiz...</span>
      </div>
    )
  }

  if (quizError) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center text-red-500">
        <p className="text-lg font-medium">Error loading quiz</p>
        <p className="text-sm">{quizError.message}</p>
      </div>
    )
  }

  if (processingResults) {
    console.log('Showing loader with states:', quizCompletionStates)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90">
        <MultiStepLoader loadingStates={quizCompletionStates} loading={true} />
      </div>
    )
  }

  if (!quiz) return <p>Loading...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F5F0] to-[#D1E2C4]/20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-semibold text-[#3A4D39]">
            {quiz?.title}
          </h1>
          <p className="mt-4 text-lg text-[#3A4D39]/80">{quiz?.description}</p>
        </motion.div>

        <Stepper
          onFinalStepCompleted={handleSubmitQuiz}
          stepCircleContainerClassName="bg-white"
          contentClassName="bg-white"
          className="w-full"
        >
          {quiz!.questions?.map((question) => (
            <Step key={question.id}>
              <QuizStep
                question={question}
                selectedAnswers={selectedAnswers}
                setSelectedAnswers={setSelectedAnswers}
              />
            </Step>
          ))}
        </Stepper>
      </div>
    </div>
  )
}

interface QuizStepProps {
  question: QuestionResponse
  selectedAnswers: { [key: string]: string[] }
  setSelectedAnswers: React.Dispatch<
    React.SetStateAction<{ [key: string]: string[] }>
  >
}

const QuizStep: React.FC<QuizStepProps> = ({
  question,
  selectedAnswers,
  setSelectedAnswers
}) => {
  const selected = selectedAnswers[question.id] || [] // Get stored answers
  const isMultipleChoice = question.questionType === 'MultipleChoice'

  const handleOptionClick = (option: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [question.id]: isMultipleChoice
        ? prev[question.id]?.includes(option)
          ? prev[question.id].filter((item) => item !== option) // Remove if already selected
          : [...(prev[question.id] || []), option] // Add new selection
        : [option] // Single choice
    }))
  }

  return (
    <div className="py-6">
      <h2 className="mb-2 text-2xl font-semibold text-[#3A4D39]">
        {question.title}
      </h2>
      <p className="mb-6 text-lg text-[#3A4D39]/80">{question.description}</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {question.questionOptions?.map((option) => (
          <motion.button
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            className={`rounded-lg border-2 p-4 text-left transition-all duration-300 ${
              selected.includes(option.id)
                ? 'border-[#3A4D39] bg-[#D1E2C4]/20'
                : 'border-gray-200 hover:border-[#3A4D39]/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-[#3A4D39]">{option.content}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default QuizPage
