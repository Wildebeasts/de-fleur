import { createFileRoute } from '@tanstack/react-router'
import SalesCustomerInsightsPage from '../pages/sales-customer-insights/SalesCustomerInsightsPage'

export const Route = createFileRoute('/sales-customer-insights')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <SalesCustomerInsightsPage />
    </>
  )
}
