/* eslint-disable @typescript-eslint/no-explicit-any */
import { useUnityContext } from 'react-unity-webgl'
import { Unity } from 'react-unity-webgl'
import { useEffect, useState } from 'react'

declare global {
  interface Window {
    onGameEnd?: (score: number) => void
  }
}

function StickHero() {
  const [error, setError] = useState<string | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)

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
    // Send a message to the Unity game to restart
    // Replace "GameController" with your actual game controller object name
    // and "RestartGame" with your actual restart method name
    if (isLoaded) {
      sendMessage('GameController', 'RestartGame')
      setGameOver(false)
    }
  }

  if (error) {
    return (
      <div>
        <h1>Error Loading Unity Game</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Stick Hero</h1>
      {!isLoaded && (
        <div>
          <p>Loading... {(loadingProgression * 100).toFixed(2)}%</p>
          <p>
            Status:{' '}
            {loadingProgression < 1
              ? 'Loading Unity framework...'
              : 'Initializing...'}
          </p>
        </div>
      )}
      <Unity
        unityProvider={unityProvider}
        style={{ width: '800px', height: '600px' }}
      />
      {gameOver && (
        <div>
          <h2>Game Over!</h2>
          <p>Your score: {score}</p>
          <button onClick={handleRestart}>Restart Game</button>
        </div>
      )}
    </div>
  )
}

export default StickHero
