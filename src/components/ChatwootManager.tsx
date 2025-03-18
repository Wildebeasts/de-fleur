/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    chatwootSDK?: {
      run: (config: { websiteToken: string; baseUrl: string }) => void
      toggle: (visibility?: boolean) => void
    }
  }
}

export default function ChatwootManager() {
  const observerRef = useRef<MutationObserver | null>(null)
  const checkIntervalRef = useRef<number | null>(null)

  useEffect(() => {
    const BASE_URL = 'https://chat.pak160404.click'
    const WIDGET_TOKEN = 'xeGPt87yu1imoruSAdPWZ5mZ'

    // Check if current page is admin
    const isAdminPage = () => window.location.pathname.includes('/admin')

    // More aggressive removal of Chatwoot elements
    const removeChatwootElements = () => {
      // Find and remove all possible Chatwoot elements
      const selectors = [
        '.woot--bubble-holder',
        '.woot--widget-holder',
        '.woot--notification',
        '#chatwoot_live_chat_widget',
        '[data-chatwoot-widget]',
        'iframe[src*="chatwoot"]'
      ]

      selectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector)
        elements.forEach((el) => el.remove())
      })

      // Also try to use the toggle API if available
      if (window.chatwootSDK?.toggle) {
        try {
          window.chatwootSDK.toggle(false)
        } catch (e) {
          console.log('Chatwoot toggle failed', e)
        }
      }
    }

    // Initialize Chatwoot for non-admin pages
    const initializeChatwoot = () => {
      if (!window.chatwootSDK) {
        const script = document.createElement('script')
        script.src = `${BASE_URL}/packs/js/sdk.js`
        script.defer = true
        script.async = true
        script.onload = function () {
          window.chatwootSDK?.run({
            websiteToken: WIDGET_TOKEN,
            baseUrl: BASE_URL
          })
        }
        document.head.appendChild(script)
      } else if (window.chatwootSDK?.toggle) {
        window.chatwootSDK.toggle(true)
      }
    }

    // Setup mutation observer to catch dynamically added Chatwoot elements
    const setupObserver = () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      observerRef.current = new MutationObserver((_mutations) => {
        if (isAdminPage()) {
          removeChatwootElements()
        }
      })

      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true
      })
    }

    // Handle route change
    const handleRouteChange = () => {
      if (isAdminPage()) {
        removeChatwootElements()
      } else {
        initializeChatwoot()
      }
    }

    // Initial check
    handleRouteChange()

    // Setup periodic check as a fallback
    checkIntervalRef.current = window.setInterval(() => {
      handleRouteChange()
    }, 1000) as unknown as number

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange)

    // Setup observer for dynamic elements
    setupObserver()

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }

      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  return null
}
