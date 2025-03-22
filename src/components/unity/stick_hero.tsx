/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useUnityContext } from 'react-unity-webgl'
import { Unity } from 'react-unity-webgl'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { RefreshCw, Coins } from 'lucide-react'
import couponApi from '@/lib/services/couponApi'
import { toast } from 'sonner'
import { useAuth } from '@/lib/context/AuthContext'

declare global {
  interface Window {
    onGameEnd?: (score: any) => void
  }
}

function StickHero() {
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [pointsEarned, setPointsEarned] = useState<number | null>(null)
  const [hasReachedDailyLimit, setHasReachedDailyLimit] = useState(false)
  const [isCheckingLimit, setIsCheckingLimit] = useState(true)
  const { isAuthenticated } = useAuth()

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

  const [gameHeight, setGameHeight] = useState(600)

  // Responsive sizing
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setGameHeight(400)
      else if (window.innerWidth < 1024) setGameHeight(500)
      else setGameHeight(600)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Check daily limit on mount
  useEffect(() => {
    const checkGameAccess = async () => {
      if (isAuthenticated) {
        console.log('isAuthenticated', isAuthenticated)
        try {
          await couponApi.startGame()
          setHasReachedDailyLimit(false)
        } catch (error) {
          setHasReachedDailyLimit(true)
          toast.warning(
            "You have reached your daily game limit. You can still play, but won't earn points."
          )
        }
      }
      setIsCheckingLimit(false)
    }
    checkGameAccess()
  }, [isAuthenticated])

  // Create a ref to hold the latest game-over handler
  const handleGameOverRef = useRef<(score: any) => void>()

  // Update the handler in the ref whenever dependencies change
  useEffect(() => {
    handleGameOverRef.current = (score) => {
      console.log('Game ended with score:', score)
      setGameOver(true)
      const parsedScore = parseInt(score, 10)
      setScore(parsedScore)
      if (isAuthenticated && !hasReachedDailyLimit) {
        couponApi
          .processGamePoints({ points: parsedScore })
          .then((response) => {
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
          })
          .catch((error) => {
            console.error('Error submitting score:', error)
            toast.error('Failed to submit your score')
          })
      } else if (isAuthenticated && hasReachedDailyLimit) {
        toast.info(
          'You have reached your daily limit. No points earned this time.'
        )
      }
    }
  }, [
    isAuthenticated,
    hasReachedDailyLimit,
    setGameOver,
    setScore,
    setPointsEarned
  ])

  // Set window.onGameEnd once on mount
  useEffect(() => {
    window.onGameEnd = (score: any) => {
      if (handleGameOverRef.current) {
        handleGameOverRef.current(score)
      }
    }
    return () => {
      delete window.onGameEnd
    }
  }, []) // Empty dependency array: runs only on mount and unmount

  const handleRestart = async () => {
    if (isLoaded) {
      if (isAuthenticated) {
        try {
          // Check if user can play before restarting
          await couponApi.startGame()
          setHasReachedDailyLimit(false)
        } catch (error) {
          setHasReachedDailyLimit(true)
          toast.warning(
            "You have reached your daily game limit. You can still play, but won't earn points."
          )
        }
      }

      setGameOver(false)
      setScore(0)
      setPointsEarned(null)
      sendMessage('GameManager', 'RestartGame')
    }
  }
  return (
    <div className="container mx-auto my-4 flex flex-col items-center px-2 md:my-8 md:px-4 lg:my-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl rounded-lg bg-white p-3 shadow-md md:p-6"
      >
        <h1 className="mb-3 text-center text-xl font-bold text-[#3A4D39] md:mb-6 md:text-2xl">
          Stick Hero
        </h1>

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
              You&apos;ve reached your daily game limit. You can still play, but
              won&apos;t earn points.
            </p>
          </div>
        ) : null}

        {!isLoaded && !isCheckingLimit && (
          <div className="my-6 flex flex-col items-center md:my-12">
            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <motion.div
                className="h-full rounded-full bg-[#3A4D39]"
                animate={{ width: `${loadingProgression * 100}%` }}
              />
            </div>
            <p className="font-medium text-gray-700">
              Loading... {(loadingProgression * 100).toFixed(0)}%
            </p>
          </div>
        )}

        {!isCheckingLimit && (
          <Unity
            unityProvider={unityProvider}
            style={{ width: '100%', height: `${gameHeight}px` }}
            className="rounded-md bg-gray-900"
          />
        )}

        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="mx-4 w-full max-w-sm rounded-lg bg-white p-4 shadow-xl md:p-6"
            >
              <h2 className="mb-2 text-center text-xl font-bold md:text-2xl">
                Game Over!
              </h2>
              <p className="mb-2 text-center text-gray-700">
                Your score:{' '}
                <span className="text-lg font-bold text-blue-600 md:text-xl">
                  {score}
                </span>
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
