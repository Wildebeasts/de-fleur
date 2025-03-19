/* eslint-disable @typescript-eslint/no-explicit-any */
import { useUnityContext } from 'react-unity-webgl'
import { Unity } from 'react-unity-webgl'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { RefreshCw, Trophy, Gamepad2 } from 'lucide-react'

declare global {
  interface Window {
    onGameEnd?: (score: number) => void
  }
}

function StickHero() {
  const [error, setError] = useState<string | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)

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
    window.onGameEnd = (finalScore) => {
      console.log('Game ended with score:', finalScore)
      setGameOver(true)
      setScore(finalScore)
    }

    return () => {
      removeEventListener('error', handleError)
      delete window.onGameEnd
    }
  }, [addEventListener, removeEventListener])

  const handleRestart = () => {
    if (isLoaded) {
      sendMessage('GameController', 'RestartGame')
      setGameOver(false)
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-xl border border-red-200 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-3 text-red-600">
            <RefreshCw className="size-6" />
            <h1 className="text-2xl font-bold">Error Loading Unity Game</h1>
          </div>
          <p className="mb-4 text-gray-700">{error}</p>
          <Button
            onClick={handleRefresh}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden rounded-xl bg-white shadow-lg"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="size-6" />
              <h1 className="text-2xl font-bold">Stick Hero</h1>
            </div>
            {isLoaded && (
              <div className="rounded-full bg-green-500 px-2 py-1 text-xs">
                Ready to Play
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {!isLoaded && (
          <div className="flex min-h-[200px] flex-col items-center justify-center p-6">
            <div className="mb-4 h-2.5 w-full max-w-md overflow-hidden rounded-full bg-gray-200">
              <motion.div
                className="h-2.5 rounded-full bg-blue-600"
                style={{ width: `${loadingProgression * 100}%` }}
                initial={{ width: 0 }}
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
                <p className="mb-6 text-center text-gray-700">
                  Your score:{' '}
                  <span className="text-xl font-bold text-blue-600">
                    {score}
                  </span>
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={handleRestart}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Play Again
                  </Button>
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700"
                  >
                    <RefreshCw className="mr-2 size-4" /> Refresh
                  </Button>
                </div>
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
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default StickHero
