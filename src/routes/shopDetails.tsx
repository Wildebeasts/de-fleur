/* eslint-disable @typescript-eslint/no-explicit-any */
import ProductDetails from '@/pages/store/ProductDetails'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import cosmeticApi from '@/lib/services/cosmeticApi'
import { Loader2 } from 'lucide-react'

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
    queryKey: ['relatedProducts', product?.cosmeticTypeId, productId], // Add productId to force refresh
    queryFn: async () => {
      const response = await cosmeticApi.getCosmetics()
      if (response.data.isSuccess && response.data.data) {
        // Filter to get products of the same type but not the current product
        const sameTypeProducts = response.data.data.filter(
          (item) =>
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

  if (!product) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <p className="text-lg text-[#3A4D39]">Product not found</p>
      </div>
    )
  }

  // Map the related products to the format expected by the RelatedProducts component
  const mappedRelatedProducts = relatedProducts?.map((item) => ({
    id: item.id,
    name: item.name || 'Unnamed Product',
    price: item.price,
    image:
      typeof item.cosmeticImages?.[0] === 'object' &&
      item.cosmeticImages?.[0] !== null
        ? (item.cosmeticImages[0] as { imageUrl?: string }).imageUrl
        : typeof item.cosmeticImages?.[0] === 'string'
          ? item.cosmeticImages[0]
          : 'https://cdn.builder.io/api/v1/image/assets/TEMP/7e1fed01c40f1a7f044a66aca0e153a5ed752c1bd54841cda7ad5862bd0ad430'
  })) || [
    // Fallback static products if no related products are found
    {
      image:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/7e1fed01c40f1a7f044a66aca0e153a5ed752c1bd54841cda7ad5862bd0ad430',
      name: 'Related Product 1',
      price: '$65.00',
      id: '123e4567-e89b-12d3-a456-426614174001'
    },
    {
      image:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/93175b3ef23a838d07b312a11cd9409acb23f04c6b28613e52e00a8bcb72709c',
      name: 'Related Product 2',
      price: '$75.00'
      // id: '123e4567-e89b-12d3-a456-426614174002'
    }
  ]

  // Fix the cosmeticImages type issue
  const processedCosmeticImages = Array.isArray(product.cosmeticImages)
    ? product.cosmeticImages.map((img) => {
        if (typeof img === 'object' && img !== null) {
          return {
            id: (img as { id?: string }).id || String(Math.random()),
            imageUrl:
              (img as { imageUrl?: string }).imageUrl ||
              'https://cdn.builder.io/api/v1/image/assets/TEMP/866f03b1126b552963088927ab1354e532e4e786039d557d037f1e0378571d45'
          }
        }
        return {
          id: String(Math.random()),
          imageUrl:
            String(img) ||
            'https://cdn.builder.io/api/v1/image/assets/TEMP/866f03b1126b552963088927ab1354e532e4e786039d557d037f1e0378571d45'
        }
      })
    : []

  return (
    <>
      <ProductDetails
        productId={productId}
        productName={product.name || 'Unnamed Product'}
        price={product.price}
        reviewCount={product.feedbacks?.length || 0}
        description={product.notice || product.mainUsage || ''}
        ingredients={product.ingredients || ''}
        instructions={product.instructions || ''}
        features={[
          {
            icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/2511e316a874482fffb66e9ae1f25c4747534339f53a06f8d27ecc82a660cac5',
            title: 'Dermatologist Tested',
            description: 'Safe for all skin types'
          },
          {
            icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/8f56d14ef016c27826ce360ccc0aa2e15a6fdf3891098d9b1d5079cc04130c8a',
            title: 'Clean Ingredients',
            description: 'No harmful chemicals'
          }
        ]}
        relatedProducts={mappedRelatedProducts.map((product) => ({
          ...product,
          image:
            product.image ||
            'https://cdn.builder.io/api/v1/image/assets/TEMP/866f03b1126b552963088927ab1354e532e4e786039d557d037f1e0378571d45'
        }))}
        productImage={
          typeof product.cosmeticImages?.[0] === 'object' &&
          product.cosmeticImages[0] !== null
            ? (product.cosmeticImages[0] as { imageUrl: string }).imageUrl
            : typeof product.cosmeticImages?.[0] === 'string'
              ? product.cosmeticImages[0]
              : 'https://cdn.builder.io/api/v1/image/assets/TEMP/866f03b1126b552963088927ab1354e532e4e786039d557d037f1e0378571d45'
        }
        cosmeticImages={processedCosmeticImages}
        feedbacks={
          product.feedbacks?.map((feedback) => {
            if (typeof feedback === 'string') {
              return {
                id: String(Math.random()),
                customerId: '',
                customerName: null,
                content: feedback,
                rating: 0
              }
            }
            return {
              id: (feedback as any).id || String(Math.random()),
              customerId: (feedback as any).customerId || '',
              customerName: (feedback as any).customerName || null,
              content: (feedback as any).content || null,
              rating: (feedback as any).rating || 0
            }
          }) || []
        }
        cosmeticSubCategories={
          product.cosmeticSubcategories ? product.cosmeticSubcategories : []
        }
      />
    </>
  )
}
