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
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [pointsEarned, setPointsEarned] = useState<number | null>(null)
  const [hasReachedDailyLimit, setHasReachedDailyLimit] = useState(false)
  const [isCheckingLimit, setIsCheckingLimit] = useState(true) // New state to track limit check
  const { isAuthenticated } = useAuth()

  const {
    unityProvider,
    isLoaded,
    loadingProgression,
    addEventListener,
    removeEventListener
  } = useUnityContext({
    loaderUrl: 'unity-build/Build/Build_Stick.loader.js',
    dataUrl: 'unity-build/Build/Build_Stick.data',
    frameworkUrl: 'unity-build/Build/Build_Stick.framework.js',
    codeUrl: 'unity-build/Build/Build_Stick.wasm'
  })

  useEffect(() => {
    // Check daily limit immediately on mount
    const checkGameAccess = async () => {
      if (isAuthenticated) {
        try {
          await couponApi.startGame()
          setHasReachedDailyLimit(false)
        } catch (error) {
          setHasReachedDailyLimit(true)
          toast.warning(
            'You’ve reached your daily game limit. You can still play, but won’t earn points.'
          )
        }
      }
      setIsCheckingLimit(false) // Mark check as complete
    }

    checkGameAccess()

    // Define game end handler
    window.onGameEnd = async (finalScore) => {
      console.log('Game ended with score:', finalScore)
      setGameOver(true)
      setScore(finalScore)

      // Only process points if authenticated, limit not reached, and check is complete
      if (isAuthenticated && !hasReachedDailyLimit && !isCheckingLimit) {
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
        } catch (error) {
          console.error('Error submitting score:', error)
          toast.error('Failed to submit your score')
        }
      } else if (isAuthenticated && hasReachedDailyLimit) {
        toast.info(
          'You’ve reached your daily limit. No points earned this time.'
        )
      }
    }

    // Cleanup
    return () => {
      delete window.onGameEnd
    }
  }, [isAuthenticated, addEventListener, removeEventListener])

  const handleRestart = () => {
    window.location.reload()
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

        {/* Show message while checking limit */}
        {isCheckingLimit ? (
          <div className="mb-6 rounded-lg bg-gray-50 p-4 text-center text-gray-700">
            <p>Checking daily game limit...</p>
          </div>
        ) : !isAuthenticated ? (
          <div className="mb-6 rounded-lg bg-amber-50 p-4 text-center text-amber-800">
            <p>Please log in to earn points from playing the game.</p>
          </div>
        ) : hasReachedDailyLimit ? (
          <div className="mb-6 rounded-lg bg-amber-50 p-4 text-center text-amber-800">
            <p>
              You’ve reached your daily game limit. You can still play, but
              won’t earn points.
            </p>
          </div>
        ) : null}

        {/* Loading progress */}
        {!isLoaded && !isCheckingLimit && (
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
          </div>
        )}

        {/* Game Container */}
        {!isCheckingLimit && (
          <Unity
            unityProvider={unityProvider}
            style={{ width: '100%', height: '600px' }}
            className="bg-gray-900"
          />
        )}

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
              <h2 className="mb-2 text-center text-2xl font-bold">
                Game Over!
              </h2>
              <p className="mb-2 text-center text-gray-700">
                Your score:{' '}
                <span className="text-xl font-bold text-blue-600">{score}</span>
              </p>

              {isAuthenticated &&
                !hasReachedDailyLimit &&
                pointsEarned !== null && (
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
      </motion.div>
    </div>
  )
}

export default StickHero
