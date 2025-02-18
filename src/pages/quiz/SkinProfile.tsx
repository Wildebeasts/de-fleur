import React from 'react'
import { SkinProfileInfo } from '@/components/Quiz/SkinProfileInfo'
import { PersonalizedRoutine } from '@/components/Quiz/PersonalizedRoutine'
import { RecommendedProducts } from '@/components/Quiz/RecommendedProducts'
import { SkincareEducation } from '@/components/Quiz/SkincareEducation'
import { NextSteps } from '@/components/Quiz/NextSteps'

const SkinProfile: React.FC = () => {
  return (
    <div className="flex flex-col">
      <div className="flex w-full flex-col bg-orange-50 px-20 pb-10 pt-5 max-md:max-w-full max-md:px-5">
        <div className="flex flex-col p-8 max-md:max-w-full max-md:px-5">
          <div className="flex w-full flex-col justify-center rounded-xl bg-white p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.1)] max-md:max-w-full max-md:px-5">
            <div className="max-md:max-w-full">
              <div className="flex gap-5 max-md:flex-col">
                <SkinProfileInfo />
              </div>
            </div>
          </div>
          <PersonalizedRoutine />
          <RecommendedProducts />
          <SkincareEducation />
          <NextSteps />
        </div>
      </div>
    </div>
  )
}

export default SkinProfile
