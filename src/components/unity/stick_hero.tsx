/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useUnityContext } from 'react-unity-webgl'
import { Unity } from 'react-unity-webgl'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import {
  RefreshCw,
  Trophy,
  Coins,
  Gamepad,
  Share2,
  ArrowLeft,
  X
} from 'lucide-react'
import couponApi from '@/lib/services/couponApi'
import { toast } from 'sonner'
import { useAuth } from '@/lib/context/AuthContext'
import { useNavigate } from '@tanstack/react-router'

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
  const [isCheckingLimit, setIsCheckingLimit] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const {
    unityProvider,
    isLoaded,
    loadingProgression,
    addEventListener,
    removeEventListener,
    sendMessage,
    requestFullscreen
  } = useUnityContext({
    loaderUrl: 'unity-build/Build/Build_Stick.loader.js',
    dataUrl: 'unity-build/Build/Build_Stick.data',
    frameworkUrl: 'unity-build/Build/Build_Stick.framework.js',
    codeUrl: 'unity-build/Build/Build_Stick.wasm'
  })

  // Get screen dimensions for truly responsive gameplay
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  // Handle orientation changes and resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('stickHeroHighScore')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10))
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  // Calculate game size - Improve mobile scaling
  const getGameHeight = () => {
    // On small screens, use most of the screen height with proper scaling
    if (dimensions.width < 640) {
      return dimensions.height - 200 // More space for controls and to prevent cutoff
    } else if (dimensions.width < 1024) {
      return 500
    } else {
      return 600
    }
  }

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
            "You have reached your daily game limit. You can still play, but won't earn points.",
            {
              position: 'bottom-center'
            }
          )
        }
      }
      setIsCheckingLimit(false)
    }

    checkGameAccess()
  }, [isAuthenticated])

  useEffect(() => {
    // Register the event handler for game end
    window.onGameEnd = (finalScore) => {
      setScore(finalScore)
      setGameOver(true)

      // Update high score if needed
      if (finalScore > highScore) {
        setHighScore(finalScore)
        localStorage.setItem('stickHeroHighScore', finalScore.toString())
      }

      // Award points if user is logged in and hasn't reached daily limit
      if (isAuthenticated && !hasReachedDailyLimit) {
        handleGameEnd(finalScore)
      }
    }

    return () => {
      window.onGameEnd = undefined
    }
  }, [isAuthenticated, hasReachedDailyLimit, highScore])

  const handleGameEnd = async (finalScore: number) => {
    try {
      const response = await couponApi.endGame(finalScore)
      setPointsEarned(response.pointsEarned)
      // Show toast notification of points earned
      toast.success(`You earned ${response.pointsEarned} points!`, {
        position: 'bottom-center'
      })
    } catch (error) {
      console.error('Error awarding points:', error)
    }
  }

  const handleRestart = () => {
    toast.info('Restarting game...', {
      position: 'bottom-center',
      duration: 1000
    })

    setTimeout(() => {
      window.location.reload()
    }, 300)

    setGameOver(false)
    setScore(0)
    setPointsEarned(null)
  }

  const handleFullscreen = () => {
    if (isLoaded) {
      requestFullscreen(true)
      setIsFullscreen(true)
    }
  }

  const exitGame = () => {
    navigate({ to: '/' })
  }

  const shareScore = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Stick Hero Game',
          text: `I scored ${score} in Stick Hero! Can you beat my score?`,
          url: window.location.href
        })
        .catch((error) => console.log('Error sharing:', error))
    } else {
      // Fallback
      toast.info('Sharing not supported on this device.', {
        position: 'bottom-center'
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F7]">
      {/* App-like header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between bg-white px-4 shadow-sm">
        <button
          onClick={exitGame}
          className="rounded-full p-2 active:bg-gray-100"
        >
          <ArrowLeft className="size-5 text-[#3A4D39]" />
        </button>
        <h1 className="text-lg font-bold text-[#3A4D39]">Stick Hero</h1>
        <div className="flex items-center gap-1">
          <p className="flex items-center gap-1 rounded-full bg-[#E8F3D6]/50 px-3 py-1 text-sm font-medium text-[#3A4D39]">
            <Trophy className="size-4" /> {highScore}
          </p>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-2 py-3">
        {/* Status messages */}
        {isCheckingLimit ? (
          <div className="mb-3 rounded-lg bg-white p-3 text-center shadow-sm">
            <p className="text-sm text-gray-700">Checking game access...</p>
          </div>
        ) : !isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 rounded-lg bg-white p-3 shadow-sm"
          >
            <p className="text-center text-sm text-[#3A4D39]">
              Log in to earn points from playing!
            </p>
          </motion.div>
        ) : hasReachedDailyLimit ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 rounded-lg bg-white p-3 shadow-sm"
          >
            <p className="text-center text-sm text-amber-700">
              Daily limit reached. You can play but won't earn points.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 rounded-lg bg-white p-3 shadow-sm"
          >
            <p className="text-center text-sm text-green-700">
              Play to earn points! Tap to extend the stick.
            </p>
          </motion.div>
        )}

        {/* Loading indicator */}
        {!isLoaded && !isCheckingLimit && (
          <div className="my-4 flex flex-col items-center px-4">
            <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <motion.div
                className="h-full rounded-full bg-[#3A4D39]"
                animate={{ width: `${loadingProgression * 100}%` }}
              ></motion.div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="size-5 animate-spin rounded-full border-2 border-[#3A4D39] border-t-transparent"></div>
              <p className="text-sm font-medium text-gray-700">
                {(loadingProgression * 100).toFixed(0)}% loaded
              </p>
            </div>
          </div>
        )}

        {/* Game Container with improved mobile CSS */}
        <div className="relative flex flex-1 flex-col">
          {!isCheckingLimit && (
            <motion.div
              className="flex-1 overflow-hidden rounded-lg shadow-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0.3 }}
            >
              <Unity
                unityProvider={unityProvider}
                style={{
                  width: '100%',
                  height: getGameHeight(),
                  // Add these to improve mobile scaling
                  maxWidth: '100vw',
                  aspectRatio: '16/9', // Ensure proper aspect ratio
                  transform: dimensions.width < 640 ? 'scale(0.95)' : 'none', // Slightly scale down on mobile
                  transformOrigin: 'center center'
                }}
                className="bg-gray-900"
              />
            </motion.div>
          )}

          {/* Game controls */}
          {isLoaded && !gameOver && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-between gap-2"
            >
              <Button
                onClick={handleFullscreen}
                variant="outline"
                className="flex-1 border-[#E8F3D6] bg-white shadow-sm hover:bg-[#E8F3D6]/50"
              >
                <Gamepad className="mr-2 size-4 text-[#3A4D39]" /> Fullscreen
              </Button>

              <Button
                onClick={shareScore}
                variant="outline"
                className="flex-1 border-[#E8F3D6] bg-white shadow-sm hover:bg-[#E8F3D6]/50"
              >
                <Share2 className="mr-2 size-4 text-[#3A4D39]" /> Share
              </Button>
            </motion.div>
          )}

          {/* Game Over Overlay - Improve button reliability */}
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mx-4 w-full max-w-xs rounded-xl bg-white p-5 shadow-xl"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#3A4D39]">
                    Game Over
                  </h2>
                  <button
                    onClick={() => setGameOver(false)}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-[#E8F3D6]/50 p-3 text-center">
                      <p className="text-xs text-gray-600">Score</p>
                      <p className="text-lg font-bold text-[#3A4D39]">
                        {score}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#E8F3D6]/50 p-3 text-center">
                      <p className="text-xs text-gray-600">High Score</p>
                      <p className="text-lg font-bold text-[#3A4D39]">
                        {highScore}
                      </p>
                    </div>
                  </div>

                  {isAuthenticated &&
                    !hasReachedDailyLimit &&
                    pointsEarned !== null && (
                      <div className="flex items-center justify-center gap-2 rounded-lg bg-amber-50 p-3">
                        <Coins className="size-5 text-amber-600" />
                        <p className="text-sm text-amber-800">
                          You earned{' '}
                          <span className="font-bold">{pointsEarned}</span>{' '}
                          points!
                        </p>
                      </div>
                    )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={exitGame}
                      className="bg-[#3A4D39] text-white hover:bg-[#4A5D49] active:bg-[#2A3D29]"
                    >
                      <ArrowLeft className="mr-1 size-4" /> Return Home
                    </Button>

                    <Button
                      onClick={shareScore}
                      variant="outline"
                      className="border-[#3A4D39] text-[#3A4D39] hover:bg-[#E8F3D6]"
                    >
                      <Share2 className="mr-1 size-4" /> Share
                    </Button>
                  </div>

                  {/* Add a text button as fallback */}
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 w-full text-center text-sm text-gray-500 hover:text-gray-700"
                  >
                    Game not restarting? Tap here
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

export default StickHero
