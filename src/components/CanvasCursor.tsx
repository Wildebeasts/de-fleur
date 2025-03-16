'use client'

import { useEffect, useState } from 'react'
import useCanvasCursor from '@/hooks/use-canvasCursor'

const CanvasCursor = () => {
  const [isAdminPage, setIsAdminPage] = useState(false)

  useEffect(() => {
    // Check if the current path includes admin
    const checkIfAdminPage = () => {
      const path = window.location.pathname
      return path.includes('/admin')
    }

    // Set initial state
    setIsAdminPage(checkIfAdminPage())

    // Create a MutationObserver to watch for DOM changes that might indicate navigation
    const observer = new MutationObserver(() => {
      setIsAdminPage(checkIfAdminPage())
    })

    // Observe changes to the document body
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    // Listen for popstate events (browser back/forward)
    const handleLocationChange = () => {
      setIsAdminPage(checkIfAdminPage())
    }
    window.addEventListener('popstate', handleLocationChange)

    // Check for route changes frequently - a more aggressive approach
    const intervalCheck = setInterval(() => {
      setIsAdminPage(checkIfAdminPage())
    }, 500)

    return () => {
      observer.disconnect()
      window.removeEventListener('popstate', handleLocationChange)
      clearInterval(intervalCheck)
    }
  }, [])

  // Only use the cursor effect on non-admin pages
  useCanvasCursor(!isAdminPage)

  // Only render the canvas on non-admin pages
  if (isAdminPage) return null

  return (
    <canvas id="canvas" className="pointer-events-none fixed inset-0 z-40" />
  )
}

export default CanvasCursor
