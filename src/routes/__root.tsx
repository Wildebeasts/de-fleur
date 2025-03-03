import {
  createRootRoute,
  Outlet,
  useMatches,
  redirect
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import Header from '../components/Header'
import FooterWrapper from '../components/index'
import { QuizResultProvider } from '@/lib/context/QuizResultContext'
import { ScrollToTop } from '../components/ScrollToTop'
import { ThemeProvider } from 'next-themes'
import authApi from '@/lib/services/authApi'

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/account_manage',
  '/cart',
  '/checkout',
  '/order_history',
  '/order_track'
]

// Add this type declaration
declare module '@tanstack/react-router' {
  interface Register {
    routeContext: {
      isAuthenticated: boolean
    }
  }
  // Add this interface to register the admin route
  interface FileRoutesByPath {
    '/admin': {
      parentRoute: typeof import('./__root').Route
    }
  }
}

export const Route = createRootRoute({
  component: RootComponent,
  beforeLoad: async ({ location }) => {
    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      location.pathname.startsWith(route)
    )

    if (!isProtectedRoute) {
      return { isAuthenticated: false }
    }

    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')

    if (!accessToken && !refreshToken) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.pathname
        }
      })
    }

    if (!accessToken && refreshToken) {
      try {
        const response = await authApi.refreshToken({
          accessToken: '',
          refreshToken
        })

        if (response.data.isSuccess && response.data.data) {
          localStorage.setItem('accessToken', response.data.data.accessToken)
          localStorage.setItem('refreshToken', response.data.data.refreshToken)
          return { isAuthenticated: true }
        }

        throw new Error('Token refresh failed')
      } catch (error) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        throw redirect({
          to: '/login',
          search: {
            redirect: location.pathname
          }
        })
      }
    }

    return { isAuthenticated: true }
  }
})

function RootComponent() {
  const matches = useMatches()
  const isAdminRoute = matches.some((match) =>
    match.pathname.includes('/admin')
  )

  return (
    <QuizResultProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme={isAdminRoute ? 'dark' : 'light'}
        forcedTheme={isAdminRoute ? 'dark' : 'light'}
        enableSystem={!isAdminRoute}
      >
        {!isAdminRoute && <Header />}
        <ScrollToTop />
        <Outlet />
        <TanStackRouterDevtools />
        {!isAdminRoute && <FooterWrapper />}
      </ThemeProvider>
    </QuizResultProvider>
  )
}
