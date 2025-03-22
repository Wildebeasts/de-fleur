/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ProductDetails from '@/pages/store/ProductDetails'
import MobileProductDetails from '@/pages/store/MobileProductDetails'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import cosmeticApi from '@/lib/services/cosmeticApi'
import { Loader2 } from 'lucide-react'
import { CosmeticResponse } from '@/lib/types/Cosmetic'
import { useIsMobile } from '@/lib/hooks/use-mobile'

export const Route = createFileRoute('/shopDetails')({
  validateSearch: (search: { productId: string }) => {
    return {
      productId: search.productId as string
    }
  },
  component: RouteComponent
})

function RouteComponent() {
  const { productId } = Route.useSearch()
  const isMobile = useIsMobile()

  const {
    data: product,
    isLoading,
    error
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await cosmeticApi.getCosmeticById(productId)
      if (response.data.isSuccess) {
        return response.data.data
      }
      throw new Error('Failed to fetch product details')
    },
    enabled: !!productId
  })

  // Fetch related products based on the same cosmetic type
  const { data: relatedProducts } = useQuery({
    queryKey: ['relatedProducts', product?.cosmeticTypeId, productId],
    queryFn: async () => {
      const response = await cosmeticApi.getCosmetics()
      if (response.data.isSuccess && response.data.data) {
        // Access the items array from the paginated response
        const sameTypeProducts = response.data.data.items.filter(
          (item: CosmeticResponse) =>
            item.cosmeticTypeId === product?.cosmeticTypeId &&
            item.id !== product?.id
        )

        // Randomize the products
        const shuffled = [...sameTypeProducts].sort(() => 0.5 - Math.random())

        // Take up to 4 products
        return shuffled.slice(0, 4)
      }
      return []
    },
    enabled: !!product?.cosmeticTypeId
  })

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#3A4D39]" />
        <span className="ml-2 text-lg text-[#3A4D39]">
          Loading product details...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center text-red-500">
        <p className="text-lg font-medium">Error loading product details</p>
        <p className="text-sm">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }

  // Use the mobile-optimized version on small screens
  if (isMobile) {
    return <MobileProductDetails product={product} relatedProducts={relatedProducts || []} />
  }

  // For desktop, render the existing component with all props
  return (
    <ProductDetails
      productId={product?.id || ''}
      productName={product?.name || ''}
      price={product?.price || 0}
      reviewCount={product?.feedbacks?.length || 0}
      description={product?.notice || ''}
      features={[]}
      relatedProducts={relatedProducts?.map(item => ({
        image: item.thumbnailUrl || (item.cosmeticImages?.[0]?.imageUrl || ''),
        name: item.name || '',
        price: item.price || 0,
        id: item.id
      })) || []}
      productImage={product?.thumbnailUrl || (product?.cosmeticImages?.[0]?.imageUrl || '')}
      cosmeticImages={product?.cosmeticImages || []}
      ingredients={product?.ingredients || ''}
      instructions={product?.instructions || ''}
      feedbacks={(product?.feedbacks || []).map(feedback => ({
        id: feedback.id,
        customerId: feedback.customer?.id,
        customer: {
          id: feedback.customer?.id || '',
          email: feedback.customer?.email || '',
          userName: feedback.customer?.userName || ''
        },
        content: feedback.content || '',
        rating: feedback.rating
      }))}
      cosmeticSubCategories={product?.cosmeticSubcategories || []}
    />
  )
}
