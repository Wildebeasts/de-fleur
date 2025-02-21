import { createFileRoute } from '@tanstack/react-router'
import ProductReviewPage from '@/pages/review/ProductReviewPage'

export const Route = createFileRoute('/review')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <ProductReviewPage />
    </>
  )
}
