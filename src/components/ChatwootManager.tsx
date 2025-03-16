import { useEffect, useState } from 'react'

declare global {
  interface Window {
    chatwootSDK?: {
      run: (config: { websiteToken: string; baseUrl: string }) => void
      toggle: (visibility?: boolean) => void
    }
  }
}

export default function ChatwootManager() {
  const [isAdminRoute, setIsAdminRoute] = useState(false)

  useEffect(() => {
    // Check if the current path includes admin
    const checkIfAdminPage = () => {
      return window.location.pathname.includes('/admin')
    }

    // Set initial state
    setIsAdminRoute(checkIfAdminPage())

    // Update state when location changes
    const handleLocationChange = () => {
      setIsAdminRoute(checkIfAdminPage())
    }

    // Listen for location changes
    window.addEventListener('popstate', handleLocationChange)
    
    // Function to initialize Chatwoot if not already initialized
    const initChatwoot = () => {
      if (!window.chatwootSDK) {
        const BASE_URL = 'https://chat.pak160404.click'
        const script = document.createElement('script')
        script.src = BASE_URL + '/packs/js/sdk.js'
        script.defer = true
        script.async = true
        script.onload = function () {
          window.chatwootSDK?.run({
            websiteToken: 'xeGPt87yu1imoruSAdPWZ5mZ',
            baseUrl: BASE_URL
          })
        }
        document.head.appendChild(script)
      }
    }

    // Function to remove Chatwoot widget container if it exists
    const removeChatwootWidget = () => {
      const chatwootWidget = document.querySelector('.woot--bubble-holder')
      if (chatwootWidget) {
        chatwootWidget.remove()
      }
      const chatwootIframe = document.getElementById(
        'chatwoot_live_chat_widget'
      )
      if (chatwootIframe) {
        chatwootIframe.remove()
      }
    }

    if (isAdminRoute) {
      // Hide Chatwoot on admin routes
      if (window.chatwootSDK?.toggle) {
        window.chatwootSDK.toggle(false)
      }
      removeChatwootWidget()
    } else {
      // Show and ensure Chatwoot is initialized on non-admin routes
      initChatwoot()
      if (window.chatwootSDK?.toggle) {
        window.chatwootSDK.toggle(true)
      }
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
    }
  }, [isAdminRoute])

  return null
}
