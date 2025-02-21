import { createFileRoute } from '@tanstack/react-router'
import FAQAndTermsPage from '@/pages/faq/FAQAndTermsPage'

export const Route = createFileRoute('/faq')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <FAQAndTermsPage />
    </>
  )
}
