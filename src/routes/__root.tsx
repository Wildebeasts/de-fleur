import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import Header from '../components/Header'
import FooterWrapper from '../components/index'
import { QuizResultProvider } from '@/context/QuizResultContext'
export const Route = createRootRoute({
  component: () => (
    <QuizResultProvider>
      <Header />
      <Outlet />
      <TanStackRouterDevtools />
      <FooterWrapper />
    </QuizResultProvider>
  )
})
