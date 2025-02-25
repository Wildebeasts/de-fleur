import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'

export function ScrollToTop() {
  const router = useRouter()

  useEffect(() => {
    // Create a subscription to router navigation events
    const unsubscribe = router.history.subscribe(() => {
      window.scrollTo(0, 0)
    })

    // Clean up subscription on component unmount
    return () => {
      unsubscribe()
    }
  }, [router])

  // This component doesn't render anything
  return null
}
