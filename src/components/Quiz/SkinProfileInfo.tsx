import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useQuizResult } from '@/lib/context/QuizResultContext'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/context/AuthContext'

// interface SkinProfileInfoItem {
//   icon: string
//   text: string
// }

// const skinProfileItems: SkinProfileInfoItem[] = [
//   {
//     icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/7e6dad096b7429d4e0d2d5a8eb20569db1a482e799cb5e64e660cd04eb69fb76?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
//     text: 'Skin Type: Combination'
//   },
//   {
//     icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/2ededb2ebe1a75033b8c2080807bb1eb4c113c10a990628b5b939215d950ce5c?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
//     text: 'Primary Concern: Anti-aging'
//   },
//   {
//     icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/746b55bae23db801fd3b3abc4e6642bbbf62df41b1c9466fac50fc021ee435b6?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
//     text: 'Sensitivity Level: Moderate'
//   }
// ]

export const SkinProfileInfo: React.FC = () => {
  const { quizResults } = useQuizResult()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (!quizResults || quizResults.length === 0) {
    return (
      <div className="flex w-full gap-6 p-4">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl font-medium text-gray-700">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/bf4ada5b0d32f74d2030ae8d23a12ee0a65c72014f5d1869d72baf17821f64fc"
                className="size-6"
                alt=""
              />
              Your Skin Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              No quiz results found. Please take the quiz.
            </p>
            <button
              onClick={() => navigate({ to: '/quiz' })}
              className="mt-4 w-full rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
            >
              Take the Quiz
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex w-full gap-6 p-4">
      {/* Skin Profile Card */}
      <Card className="flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl font-medium text-gray-700">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/bf4ada5b0d32f74d2030ae8d23a12ee0a65c72014f5d1869d72baf17821f64fc"
              className="size-6"
              alt=""
            />
            Your Skin Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quizResults.length > 0 && (
              <div className="flex flex-col gap-3 rounded-lg p-3">
                <h3 className="text-lg font-semibold text-gray-700">
                  Your Skin Type: {quizResults[0].skinType.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {quizResults[0].skinType.description}
                </p>

                {/* Additional Skin Properties */}
                <ul className="list-disc pl-5 text-sm text-gray-600">
                  <li>{quizResults[0].skinType.isDry ? 'Dry' : 'Oily'}</li>
                  <li>
                    {quizResults[0].skinType.isSensitive
                      ? 'Sensitive'
                      : 'Not Sensitive'}
                  </li>
                  <li>
                    {quizResults[0].skinType.isUneven
                      ? 'Pigmented'
                      : 'Even-Toned'}
                  </li>
                  <li>
                    {quizResults[0].skinType.isWrinkle
                      ? 'Wrinkle-Prone'
                      : 'Smooth'}
                  </li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-gray-700">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!isAuthenticated && (
            <Button
              variant="secondary"
              className="w-full bg-pink-200 hover:bg-pink-300"
            >
              Save Results to Profile
            </Button>
          )}

          {/* <Button variant="outline" className="w-full">
            Share Results
          </Button> */}
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/quiz' })}
            className="w-full bg-pink-200 hover:bg-pink-300"
          >
            Retake Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
