import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import Header from '../components/Header'
import FooterWrapper from '../components/index'
import { QuizResultProvider } from '@/lib/context/QuizResultContext'
import { ScrollToTop } from '../components/ScrollToTop'

export const Route = createRootRoute({
  component: () => (
    <QuizResultProvider>
      <Header />
      <ScrollToTop />
      <Outlet />
      <TanStackRouterDevtools />
      <FooterWrapper />
    </QuizResultProvider>
  )
})
