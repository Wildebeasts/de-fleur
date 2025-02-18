import ProductDetails from '@/pages/store/ProductDetails'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/shopDetails')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <ProductDetails
        productName="Sample Product"
        price="29.99"
        reviewCount={42}
        description="Product description here"
        features={[]}
        relatedProducts={[]}
      />
    </>
  )
}
