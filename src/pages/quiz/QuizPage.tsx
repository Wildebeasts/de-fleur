import React, { useState } from 'react'
import Stepper, { Step } from '@/components/Stepper'
import { motion } from 'framer-motion'
import {
  MultiStepLoader,
  quizCompletionStates
} from '@/components/ui/multi-step-loader'
import { useNavigate } from '@tanstack/react-router'

const QuizPage: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleQuizComplete = () => {
    setIsLoading(true)
    // After 8 seconds (4 states × 2 seconds each), redirect to results
    setTimeout(() => {
      navigate({ to: '/quiz_result' })
    }, 8000)
  }

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
              Find Your Perfect Skincare Routine
            </h1>
            <p className="mt-4 text-lg text-[#3A4D39]/80">
              Answer a few questions to get personalized product recommendations
            </p>
          </motion.div>

          <Stepper
            onFinalStepCompleted={handleQuizComplete}
            stepCircleContainerClassName="bg-white"
            contentClassName="bg-white"
          >
            <Step>
              <QuizStep
                title="Skin Type"
                question="What's your skin type?"
                options={['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive']}
              />
            </Step>

            <Step>
              <QuizStep
                title="Skin Concerns"
                question="What are your main skin concerns?"
                options={[
                  'Acne',
                  'Aging',
                  'Dark spots',
                  'Dullness',
                  'Uneven texture'
                ]}
                multiple
              />
            </Step>

            <Step>
              <QuizStep
                title="Current Routine"
                question="How would you describe your current skincare routine?"
                options={[
                  'Minimal (1-2 products)',
                  'Basic (3-4 products)',
                  'Moderate (5-7 products)',
                  'Extensive (8+ products)'
                ]}
              />
            </Step>

            <Step>
              <QuizStep
                title="Product Preferences"
                question="What's important to you in skincare products?"
                options={[
                  'Natural ingredients',
                  'Fragrance-free',
                  'Cruelty-free',
                  'Sustainable packaging',
                  'Clinical results'
                ]}
                multiple
              />
            </Step>
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
  title: string
  question: string
  options: string[]
  multiple?: boolean
}

const QuizStep: React.FC<QuizStepProps> = ({
  title,
  question,
  options,
  multiple = false
}) => {
  const [selected, setSelected] = React.useState<string[]>([])

  const handleOptionClick = (option: string) => {
    if (multiple) {
      setSelected((prev) =>
        prev.includes(option)
          ? prev.filter((item) => item !== option)
          : [...prev, option]
      )
    } else {
      setSelected([option])
    }
  }

  return (
    <div className="py-6">
      <h2 className="mb-2 text-2xl font-semibold text-[#3A4D39]">{title}</h2>
      <p className="mb-6 text-lg text-[#3A4D39]/80">{question}</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {options.map((option) => (
          <motion.button
            key={option}
            onClick={() => handleOptionClick(option)}
            className={`rounded-lg border-2 p-4 text-left transition-all duration-300 ${
              selected.includes(option)
                ? 'border-[#3A4D39] bg-[#D1E2C4]/20'
                : 'border-gray-200 hover:border-[#3A4D39]/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-[#3A4D39]">{option}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default QuizPage
