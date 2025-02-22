import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import Header from '../components/Header'
import FooterWrapper from '../components/index'
import AdminLayout from '../routes/admin.lazy'

export const Route = createRootRoute({
  component: () => {
    const location = window.location.pathname
    const isAdminRoute = location.startsWith('/admin')

    if (isAdminRoute) {
      return (
        <>
          <AdminLayout>
            <Outlet />
          </AdminLayout>
          <TanStackRouterDevtools />
        </>
      )
    }

    return (
      <>
        <Header />
        <Outlet />
        <TanStackRouterDevtools />
        <FooterWrapper />
      </>
    )
  }
})
