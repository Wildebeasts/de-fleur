'use client'

import React from 'react'

interface QuizButtonProps {
  onClick: () => void
  className?: string
}

export const QuizButton: React.FC<QuizButtonProps> = ({
  onClick,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-full bg-[#3A4D39] px-12 py-5 text-2xl text-white shadow-lg transition-all duration-300 hover:bg-[#4A5D49] focus:outline-none focus:ring-2 focus:ring-[#3A4D39]/50 focus:ring-offset-2 ${className}`}
      aria-label="Start skincare quiz"
    >
      <span className="relative z-10">Start Quiz</span>
      <div className="absolute inset-0 -translate-x-full bg-[#739072] opacity-30 transition-transform duration-300 group-hover:translate-x-0" />
    </button>
  )
}

export default QuizButton
