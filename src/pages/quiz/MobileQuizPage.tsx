import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MultiStepLoader,
  quizCompletionStates
} from '@/components/ui/multi-step-loader'
import { useNavigate } from '@tanstack/react-router'
import { useQuizResult } from '@/lib/context/QuizResultContext'
import { useGetQuiz, useSubmitQuiz } from '@/lib/hooks/useQuiz'
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuizSubmission {
  id: string
  data: {
    answers: {
      questionId: string
      selectedOptionIds: string[]
    }[]
  }
}

const MobileQuizPage: React.FC = () => {
  const navigate = useNavigate()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
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

    // Submit the quiz
    setTimeout(() => {
      submitQuiz(
        {
          id: quiz.id,
          data: { answers }
        },
        {
          onSuccess: (data) => {
            setQuizResults(data)
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
    }, 100)
  }

  const goToNextQuestion = () => {
    if (!quiz) return

    if (currentQuestionIndex < (quiz.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleSubmitQuiz()
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  // Check if the current question has been answered
  const isCurrentQuestionAnswered = () => {
    if (!quiz || !quiz.questions) return false
    const currentQuestion = quiz.questions[currentQuestionIndex]
    return selectedAnswers[currentQuestion.id]?.length > 0
  }

  if (isQuizLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#3A4D39]" />
        <span className="ml-2 text-lg text-[#3A4D39]">Loading quiz...</span>
      </div>
    )
  }

  if (quizError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-red-500">
        <p className="text-lg font-medium">Error loading quiz</p>
        <p className="text-sm">{quizError.message}</p>
      </div>
    )
  }

  if (processingResults) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90">
        <MultiStepLoader loadingStates={quizCompletionStates} loading={true} />
      </div>
    )
  }

  if (!quiz || !quiz.questions) return <p>Loading...</p>

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F5F0] to-[#D1E2C4]/20">
      <div className="px-4 py-6">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-[#3A4D39]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-[#3A4D39]/70">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </p>
        </div>

        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl bg-white p-5 shadow-sm"
        >
          <h2 className="mb-3 text-xl font-semibold text-[#3A4D39]">
            {currentQuestion.title}
          </h2>
          <p className="mb-4 text-[#3A4D39]/80">
            {currentQuestion.description}
          </p>

          <div className="space-y-3">
            {currentQuestion.questionOptions?.map((option) => {
              const isSelected =
                selectedAnswers[currentQuestion.id]?.includes(option.id) ||
                false
              const isMultipleChoice =
                currentQuestion.questionType === 'MultipleChoice'

              return (
                <motion.button
                  key={option.id}
                  onClick={() => {
                    setSelectedAnswers((prev) => ({
                      ...prev,
                      [currentQuestion.id]: isMultipleChoice
                        ? prev[currentQuestion.id]?.includes(option.id)
                          ? prev[currentQuestion.id].filter(
                              (item) => item !== option.id
                            )
                          : [...(prev[currentQuestion.id] || []), option.id]
                        : [option.id]
                    }))
                  }}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                    isSelected
                      ? 'border-[#3A4D39] bg-[#D1E2C4]/20'
                      : 'border-gray-200'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center">
                    <div
                      className={`mr-3 size-5 rounded-full border-2 ${
                        isSelected
                          ? 'border-[#3A4D39] bg-[#3A4D39]'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="flex size-full items-center justify-center">
                          <div className="size-2 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-[#3A4D39]">{option.content}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        <div className="mt-6 flex items-center justify-between">
          <Button
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center ${
              currentQuestionIndex === 0 ? 'invisible' : ''
            }`}
            variant="outline"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>

          <Button
            onClick={goToNextQuestion}
            disabled={!isCurrentQuestionAnswered()}
            className="bg-[#3A4D39] text-white hover:bg-[#3A4D39]/90"
          >
            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <>
                Next
                <ArrowRight className="ml-2 size-4" />
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MobileQuizPage
