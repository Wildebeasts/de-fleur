/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useUnityContext } from 'react-unity-webgl'
import { Unity } from 'react-unity-webgl'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { RefreshCw, Trophy, Coins } from 'lucide-react'
import couponApi from '@/lib/services/couponApi'
import { toast } from 'sonner'
import { useAuth } from '@/lib/context/AuthContext'

declare global {
  interface Window {
    onGameEnd?: (score: number) => void
  }
}

function StickHero() {
  const [error, setError] = useState<string | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [pointsEarned, setPointsEarned] = useState<number | null>(null)
  const { isAuthenticated } = useAuth()

  // Keep Unity provider logic exactly the same
  const {
    unityProvider,
    isLoaded,
    loadingProgression,
    addEventListener,
    removeEventListener,
    sendMessage
  } = useUnityContext({
    loaderUrl: 'unity-build/Build/Build_Stick.loader.js',
    dataUrl: 'unity-build/Build/Build_Stick.data',
    frameworkUrl: 'unity-build/Build/Build_Stick.framework.js',
    codeUrl: 'unity-build/Build/Build_Stick.wasm'
  })

  useEffect(() => {
    const handleError = (errorMessage: any) => {
      console.error('Unity error:', errorMessage)
      setError(errorMessage)
    }

    addEventListener('error', handleError)

    // Define the global function that Unity will call when the game ends
    window.onGameEnd = async (finalScore) => {
      console.log('Game ended with score:', finalScore)
      setGameOver(true)
      setScore(finalScore)

      // Submit score to backend if user is authenticated
      if (isAuthenticated) {
        try {
          const response = await couponApi.processGamePoints({
            points: finalScore
          })
          if (response.data.isSuccess) {
            setPointsEarned(response.data.data?.userPoints || 0)
            toast.success(
              `You earned ${response.data.data?.userPoints || 0} points!`
            )
          } else {
            toast.error(
              response.data.message || 'Failed to process game points'
            )
          }
        } catch (error: any) {
          console.error('Error submitting score:', error)
          toast.error('Failed to submit your score')
        }
      }
    }

    // Notify backend that game has started (if authenticated)
    const notifyGameStart = async () => {
      if (isAuthenticated && isLoaded) {
        try {
          await couponApi.startGame()
        } catch (error: any) {
          // Just log the error but don't prevent game from starting
          console.error('Error notifying game start:', error)
        }
      }
    }

    if (isLoaded) {
      notifyGameStart()
    }

    return () => {
      removeEventListener('error', handleError)
      delete window.onGameEnd
    }
  }, [addEventListener, removeEventListener, isAuthenticated, isLoaded])

  const handleRestart = () => {
    window.location.reload()
  }

  if (error) {
    return (
      <div className="container mx-auto my-12 flex flex-col items-center">
        <div className="w-full max-w-3xl rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-4 text-2xl font-bold text-red-600">
            Error Loading Unity Game
          </h1>
          <p className="mb-4 text-gray-700">{error}</p>
          <Button
            onClick={handleRestart}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto my-12 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-md"
      >
        <h1 className="mb-6 text-center text-2xl font-bold text-[#3A4D39]">
          Stick Hero
        </h1>

        {!isAuthenticated && (
          <div className="mb-6 rounded-lg bg-amber-50 p-4 text-center text-amber-800">
            <p>Please log in to earn points from playing the game.</p>
          </div>
        )}

        {!isLoaded && (
          <div className="my-12 flex flex-col items-center">
            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <motion.div
                className="h-full rounded-full bg-[#3A4D39]"
                animate={{ width: `${loadingProgression * 100}%` }}
              ></motion.div>
            </div>
            <p className="font-medium text-gray-700">
              Loading... {(loadingProgression * 100).toFixed(0)}%
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {loadingProgression < 1
                ? 'Loading Unity framework...'
                : 'Initializing...'}
            </p>
          </div>
        )}

        {/* Game Container */}
        <div className="relative">
          <Unity
            unityProvider={unityProvider}
            style={{ width: '100%', height: '600px' }}
            className="bg-gray-900"
          />

          {/* Game Over Overlay */}
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
              >
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-yellow-100 p-3">
                    <Trophy className="size-10 text-yellow-500" />
                  </div>
                </div>
                <h2 className="mb-2 text-center text-2xl font-bold">
                  Game Over!
                </h2>
                <p className="mb-2 text-center text-gray-700">
                  Your score:{' '}
                  <span className="text-xl font-bold text-blue-600">
                    {score}
                  </span>
                </p>

                {isAuthenticated && pointsEarned !== null && (
                  <div className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-amber-50 p-3 text-amber-800">
                    <Coins className="size-5" />
                    <p>
                      You earned{' '}
                      <span className="font-bold">{pointsEarned}</span> points!
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleRestart}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  <RefreshCw className="mr-2 size-4" /> Play Again
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Instructions */}
        {isLoaded && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <p className="text-center text-sm text-gray-600">
              Click and hold to extend the stick, then release to jump across
              platforms.
            </p>
            {isAuthenticated && (
              <p className="mt-2 text-center text-sm text-[#3A4D39]">
                Earn points based on your score to exchange for coupons!
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default StickHero
