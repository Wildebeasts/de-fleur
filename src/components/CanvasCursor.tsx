'use client'

import { useEffect, useState } from 'react'
import useCanvasCursor from '@/hooks/use-canvasCursor'

const CanvasCursor = () => {
  const [isAdminPage, setIsAdminPage] = useState(false)

  useEffect(() => {
    // Check if the current path includes admin_dashboard
    const checkIfAdminPage = () => {
      const path = window.location.pathname
      return path.includes('/admin')
    }

    // Set initial state
    setIsAdminPage(checkIfAdminPage())

    // Update state when location changes
    const handleLocationChange = () => {
      setIsAdminPage(checkIfAdminPage())
    }

    // Listen for location changes
    window.addEventListener('popstate', handleLocationChange)

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
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
