import { useQuizResult } from '@/lib/context/QuizResultContext'
import React from 'react'

// interface RoutineStep {
//   number: string
//   title: string
//   duration: string
// }

// interface RoutineSection {
//   title: string
//   icon: string
//   steps: RoutineStep[]
// }

// const routineSections: RoutineSection[] = [
//   {
//     title: 'Morning Routine',
//     icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/8d5693cc33fc9c959f2b11677fbd17099cb9dbca782e532eb843823327f1fe07?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
//     steps: [
//       { number: '1', title: 'Gentle Cleanser', duration: '2-3 minutes' },
//       { number: '2', title: 'Vitamin C Serum', duration: '1-2 minutes' },
//       { number: '3', title: 'Moisturizer', duration: '1-2 minutes' }
//     ]
//   },
//   {
//     title: 'Evening Routine',
//     icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/d357c0e41bc16f454ecb30097300322234147e34df292cd24a8668adc09129f7?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
//     steps: [
//       { number: '1', title: 'Double Cleanse', duration: '4-5 minutes' },
//       { number: '2', title: 'Retinol Treatment', duration: '1-2 minutes' },
//       { number: '3', title: 'Night Cream', duration: '1-2 minutes' }
//     ]
//   }
// ]

export const PersonalizedRoutine: React.FC = () => {
  const { quizResults } = useQuizResult()

  if (!quizResults || quizResults.length === 0) {
    return (
      <div className="mt-12 flex w-full flex-col rounded-xl bg-white p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.1)] max-md:mt-10 max-md:max-w-full max-md:px-5">
        <h2 className="pb-3.5 pt-px text-2xl font-semibold text-black max-md:max-w-full max-md:pr-5">
          Your Personalized Routine
        </h2>
        <p className="text-gray-500">No routine available.</p>
      </div>
    )
  }

  return (
    <div className="mt-12 flex w-full flex-col rounded-xl bg-white p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.1)] max-md:mt-10 max-md:max-w-full max-md:px-5">
      <h2 className="pb-3.5 pt-px text-2xl font-semibold text-black max-md:max-w-full max-md:pr-5">
        Your Personalized Routine
      </h2>
      <div className="mt-6 max-md:max-w-full">
        <div className="flex gap-5 max-md:flex-col">
          {quizResults.map((routine, index) => (
            <div
              key={index}
              className="flex w-6/12 flex-col max-md:ml-0 max-md:w-full"
            >
              <div className="mx-auto flex w-full flex-col py-px max-md:mt-8 max-md:max-w-full">
                <div className="flex max-w-full gap-2">
                  <h3 className="w-[148px] shrink grow text-xl leading-none text-black">
                    {routine.title} ({routine.period})
                  </h3>
                </div>
                <div className="mt-5 flex w-full flex-col text-black max-md:max-w-full">
                  {routine.routineSteps.map((step, stepIndex) => (
                    <div
                      key={stepIndex}
                      className="mt-4 flex flex-wrap gap-3 rounded-lg border border-solid py-3.5 pl-3.5 pr-20 max-md:pr-5"
                    >
                      <div className="my-auto size-8 whitespace-nowrap rounded-full bg-orange-50 px-3.5 pb-3.5 pt-1.5 text-base">
                        {step.stepNumber}
                      </div>
                      <div className="flex flex-col pb-2 pt-0.5 leading-none">
                        <div className="text-base font-medium">
                          {step.cosmeticName}
                        </div>
                        <div className="mt-3 self-start text-sm text-gray-600">
                          {step.cosmeticNotice}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-gray-700">
                          ${step.cosmeticPrice}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 flex w-full flex-col justify-center rounded-lg bg-orange-50 p-4 text-sm leading-none text-black max-md:max-w-full">
        <div className="flex flex-wrap gap-10 max-md:max-w-full">
          <div className="flex flex-1 flex-col py-1">
            <div>Total Time: 15-20 minutes daily</div>
            <div className="mt-2 self-start">Difficulty Level: Moderate</div>
          </div>
          <div className="flex flex-1 flex-col pb-2.5">
            <div>
              Estimated Budget: $
              {quizResults
                ?.flatMap((routine) => routine?.routineSteps || []) // Ensure routineSteps exists
                ?.reduce(
                  (sum, step) => sum + (Number(step?.cosmeticPrice) || 0),
                  0
                )}
            </div>
            <div className="mt-1.5 self-start">
              Products Needed:{' '}
              {quizResults.flatMap((r) => r.routineSteps).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
