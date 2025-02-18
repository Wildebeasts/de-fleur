import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import Header from '../components/Header'
import FooterWrapper from '../components/index'
export const Route = createRootRoute({
  component: () => (
    <>
      <Header />
      <Outlet />
      <TanStackRouterDevtools />
      <FooterWrapper />
    </>
  )
})
