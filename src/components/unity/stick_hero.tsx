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
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl rounded-xl bg-gradient-to-b from-white to-gray-50 p-4 shadow-lg md:p-6"
      >
        <h1 className="mb-4 text-center text-2xl font-bold text-[#3A4D39] md:mb-6 md:text-3xl lg:text-4xl">
          Stick Hero
        </h1>

        {isCheckingLimit ? (
          <div className="mb-6 rounded-lg bg-gray-100 p-4 text-center text-gray-700 shadow-inner">
            <div className="flex items-center justify-center space-x-2">
              <div className="size-5 animate-spin rounded-full border-y-2 border-[#3A4D39]"></div>
              <p>Checking daily game limit...</p>
            </div>
          </div>
        ) : !isAuthenticated ? (
          <div className="mb-6 rounded-lg bg-amber-50 p-4 text-center text-amber-800 shadow-inner">
            <p className="font-medium">
              Please log in to earn points from playing the game.
            </p>
          </div>
        ) : hasReachedDailyLimit ? (
          <div className="mb-6 rounded-lg bg-amber-50 p-4 text-center text-amber-800 shadow-inner">
            <p className="font-medium">
              You&apos;ve reached your daily game limit. You can still play, but
              won&apos;t earn points.
            </p>
          </div>
        ) : (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-center text-green-800 shadow-inner">
            <p className="font-medium">
              Play to earn points! Stretch the stick and reach the platform.
            </p>
          </div>
        )}

        {!isLoaded && !isCheckingLimit && (
          <div className="my-6 flex flex-col items-center md:my-12">
            <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#3A4D39] to-[#5a7456]"
                animate={{ width: `${loadingProgression * 100}%` }}
                transition={{ ease: 'easeInOut' }}
              />
            </div>
            <p className="font-medium text-gray-700">
              Loading Game... {(loadingProgression * 100).toFixed(0)}%
            </p>
          </div>
        )}

        {!isCheckingLimit && (
          <div className="overflow-hidden rounded-xl border-2 border-[#3A4D39] shadow-md">
            <Unity
              unityProvider={unityProvider}
              style={{ width: '100%', height: `${gameHeight}px` }}
              className="bg-gradient-to-b from-blue-400 to-blue-600"
            />
          </div>
        )}

        {/* Game Instructions */}
        <div className="mt-6 rounded-lg bg-gray-50 p-4 shadow-inner">
          <h3 className="mb-2 font-bold text-[#3A4D39]">How to Play:</h3>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            <li>Press and hold to extend the stick</li>
            <li>Release to drop the stick</li>
            <li>Make it reach the next platform</li>
            <li>Earn points based on your score!</li>
          </ul>
        </div>

        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
            >
              <h2 className="mb-4 text-center text-2xl font-bold text-[#3A4D39] md:text-3xl">
                Game Over!
              </h2>
              <div className="mb-4 flex flex-col items-center justify-center">
                <p className="text-gray-700">Your score:</p>
                <span className="text-3xl font-bold text-[#3A4D39] md:text-4xl">
                  {score}
                </span>
              </div>

              {isAuthenticated &&
                !hasReachedDailyLimit &&
                pointsEarned !== null && (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-amber-50 p-4 text-amber-800 shadow-inner"
                  >
                    <Coins className="size-6 text-amber-600" />
                    <p className="text-lg">
                      You earned{' '}
                      <span className="font-bold text-amber-600">
                        {pointsEarned}
                      </span>{' '}
                      points!
                    </p>
                  </motion.div>
                )}

              <Button
                onClick={handleRestart}
                className="w-full rounded-lg bg-gradient-to-r from-[#3A4D39] to-[#5a7456] py-3 text-lg text-white shadow-md transition-all duration-300 hover:from-[#314832] hover:to-[#4a6046]"
              >
                <RefreshCw className="animate-spin-slow mr-2 size-5" /> Play
                Again
              </Button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default StickHero
