'use client'

import React from 'react'
import QuizButton from './QuizButton'
import { useNavigate } from '@tanstack/react-router'

export const SkincareQuizHero: React.FC = () => {
  const navigate = useNavigate()

  const handleStartQuiz = () => {
    navigate({ to: '/quiz' })
  }

  return (
    <section
      className="relative overflow-hidden bg-[#D1E2C4] px-8 py-32 text-center text-black"
      role="banner"
    >
      {/* Decorative elements */}
      <div className="absolute left-0 top-0 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#A7C4BC]/30 blur-3xl" />
      <div className="absolute right-0 top-1/2 size-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#E8F3D6]/40 blur-3xl" />

      {/* Leaf decorations */}
      <LeafDecoration className="absolute left-10 top-20 size-16 rotate-45 text-[#739072]/30" />
      <LeafDecoration className="absolute bottom-20 right-10 size-20 -rotate-12 text-[#739072]/20" />
      <LeafDecoration className="absolute left-1/4 top-3/4 size-12 rotate-90 text-[#739072]/25" />

      <div className="relative mx-auto max-w-4xl px-4">
        <div className="flex flex-col items-center justify-center gap-12">
          <h1 className="text-5xl font-semibold leading-tight tracking-tight text-[#3A4D39] md:text-7xl">
            Discover Your Perfect
            <br />
            <span className="relative">
              Skincare Routine
              <svg
                className="absolute -bottom-4 left-0 w-full text-[#739072]/30"
                height="12"
                viewBox="0 0 100 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 5.5C20 5.5 40 5.5 59 5.5C78 5.5 97 5.5 116 5.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="1 8"
                />
              </svg>
            </span>
          </h1>
          <p className="max-w-2xl text-xl leading-relaxed text-[#3A4D39]/80 md:text-2xl">
            Take our 2-minute quiz to get personalized product recommendations
            based on your skin type and concerns.
          </p>
          <QuizButton
            onClick={handleStartQuiz}
            className="transition-all duration-300 hover:scale-105"
          />
        </div>
      </div>
    </section>
  )
}

const LeafDecoration = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.0001 2C6.49713 2 2.00013 6.497 2.00013 12C2.00013 17.503 6.49713 22 12.0001 22C17.5031 22 22.0001 17.503 22.0001 12C22.0001 6.497 17.5031 2 12.0001 2ZM15.7071 9.707L11.0001 14.414L8.29313 11.707C7.90213 11.316 7.90213 10.684 8.29313 10.293C8.68413 9.902 9.31613 9.902 9.70713 10.293L11.0001 11.586L14.2931 8.293C14.6841 7.902 15.3161 7.902 15.7071 8.293C16.0981 8.684 16.0981 9.316 15.7071 9.707Z" />
  </svg>
)

export default SkincareQuizHero
