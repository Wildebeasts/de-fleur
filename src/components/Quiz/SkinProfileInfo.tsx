import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SkinProfileInfoItem {
  icon: string
  text: string
}

const skinProfileItems: SkinProfileInfoItem[] = [
  {
    icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/7e6dad096b7429d4e0d2d5a8eb20569db1a482e799cb5e64e660cd04eb69fb76?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    text: 'Skin Type: Combination'
  },
  {
    icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/2ededb2ebe1a75033b8c2080807bb1eb4c113c10a990628b5b939215d950ce5c?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    text: 'Primary Concern: Anti-aging'
  },
  {
    icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/746b55bae23db801fd3b3abc4e6642bbbf62df41b1c9466fac50fc021ee435b6?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    text: 'Sensitivity Level: Moderate'
  }
]

export const SkinProfileInfo: React.FC = () => {
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
            {skinProfileItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <img src={item.icon} className="size-4" alt="" />
                <span className="text-sm text-gray-600">{item.text}</span>
              </div>
            ))}
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
          <Button
            variant="secondary"
            className="w-full bg-pink-200 hover:bg-pink-300"
          >
            Save Results to Profile
          </Button>
          <Button variant="outline" className="w-full">
            Share Results
          </Button>
          <Button variant="outline" className="w-full">
            Retake Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
