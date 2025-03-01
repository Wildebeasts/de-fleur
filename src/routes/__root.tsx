import { createRootRoute, Outlet, useMatches } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import Header from '../components/Header'
import FooterWrapper from '../components/index'
import { QuizResultProvider } from '@/lib/context/QuizResultContext'
import { ScrollToTop } from '../components/ScrollToTop'
import { ThemeProvider } from 'next-themes'

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
  // Add the context here
  beforeLoad: () => {
    return {
      isAuthenticated: !!localStorage.getItem('accessToken') // or however you check auth
    }
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
