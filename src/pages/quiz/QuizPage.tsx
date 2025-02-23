import React, { useEffect, useState } from 'react'
import Stepper, { Step } from '@/components/Stepper'
import { motion } from 'framer-motion'
import {
  MultiStepLoader,
  quizCompletionStates
} from '@/components/ui/multi-step-loader'
import { useNavigate } from '@tanstack/react-router'
import quizApi from '@/services/quizApi'
import { QuizResponse } from '@/types/Quiz'
import { QuestionResponse } from '@/types/Question'
import { useQuizResult } from '@/context/QuizResultContext'

const QuizPage: React.FC = () => {
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState<QuizResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string[]
  }>({})

  const { setQuizResults } = useQuizResult()

  useEffect(() => {
    quizApi
      .getQuiz()
      .then((response) => {
        if (response.data.isSuccess) {
          console.log(response.data)
          setQuiz(response.data.data!)
        }
      })
      .catch((err) => {
        console.error('Error fetching quiz:', err)
      })
  }, [])

  const handleQuizComplete = () => {
    setIsLoading(true)

    // Convert selectedAnswers state to QuizSubmitRequest format
    const formattedAnswers = Object.entries(selectedAnswers).map(
      ([questionId, selectedOptionIds]) => ({
        questionId, // Convert question ID string to Guid (backend handles it)
        selectedOptionIds
      })
    )

    const quizSubmitRequest = { answers: formattedAnswers }

    // Create a promise for the quiz submission
    const submitQuizPromise = quizApi
      .submitQuiz(String(quiz?.id), quizSubmitRequest)
      .then((response) => {
        if (response.data.isSuccess) {
          console.log(response.data)
          setQuizResults(response.data.data!)
        }
      })
      .catch((err) => {
        console.error('Error submitting quiz:', err)
      })

    // Create a promise for the animation delay (8 seconds)
    const animationDelayPromise = new Promise((resolve) =>
      setTimeout(resolve, 8000)
    )

    // Wait for both the API and animation before navigating
    Promise.all([submitQuizPromise, animationDelayPromise]).then(() => {
      setIsLoading(false)
      navigate({
        to: '/quiz_result'
      })
    })
  }

  if (!quiz) return <p>Loading...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F5F0] to-[#D1E2C4]/20">
      {!isLoading ? (
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="text-4xl font-semibold text-[#3A4D39]">
              {quiz?.title}
            </h1>
            <p className="mt-4 text-lg text-[#3A4D39]/80">
              {quiz?.description}
            </p>
          </motion.div>

          <Stepper
            onFinalStepCompleted={handleQuizComplete}
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
      ) : (
        <MultiStepLoader
          loadingStates={quizCompletionStates}
          loading={isLoading}
          duration={2000}
          loop={false}
        />
      )}
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
