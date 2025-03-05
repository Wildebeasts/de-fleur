import React from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, Mail } from 'lucide-react'
import { useQuizResult } from '@/lib/context/QuizResultContext'

// interface Product {
//   image: string
//   name: string
//   description: string
//   price: string
//   benefit: string
// }

// const products: Product[] = [
//   {
//     image:
//       'https://cdn.builder.io/api/v1/image/assets/TEMP/e3a8551757b9ba9bdd7fd97d084ceae368e084d5fd7cfa49e0b8ef9618d53389?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
//     name: 'Gentle Foaming Cleanser',
//     description: 'Sulfate-free cleanser for sensitive skin',
//     price: '$45',
//     benefit: 'Perfect for your combination skin'
//   },
//   {
//     image:
//       'https://cdn.builder.io/api/v1/image/assets/TEMP/931e1f62e35d467c1a8c8eff9824ad99018e747659175a9ac4bd2cbda256ce5a?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
//     name: 'Vitamin C Serum',
//     description: '15% Vitamin C with Ferulic Acid',
//     price: '$85',
//     benefit: 'Targets aging concerns'
//   },
//   {
//     image:
//       'https://cdn.builder.io/api/v1/image/assets/TEMP/317f49a60e9b22197337cc922c396fbe559b4287f1e03a6424b3bd699dac03c9?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
//     name: 'Hydrating Moisturizer',
//     description: 'Light-weight daily moisturizer',
//     price: '$65',
//     benefit: 'Balances combination skin'
//   }
// ]

export const RecommendedProducts: React.FC = () => {
  const { quizResults } = useQuizResult()

  // Extract recommended products from quizResults
  const products = quizResults?.flatMap((result) => result.routineSteps) || []

  return (
    <Card className="mt-12 w-full p-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Recommended Products</h2>
        <h3 className="text-xl">Essential Products</h3>
      </div>

      <div className="mt-6">
        {products.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {products.map((product, index) => (
              <Card key={index} className="w-full border shadow-sm">
                <CardContent className="space-y-4 p-4">
                  <img
                    src={product.cosmeticImageUrl} // Assuming API returns this field
                    className="h-48 w-full rounded-lg object-cover"
                    alt={product.cosmeticName}
                  />
                  <div className="space-y-2">
                    <h4 className="font-medium">{product.cosmeticName}</h4>
                    {/* <p className="text-sm text-muted-foreground">
                      {product.cosmeticDescription}
                    </p> */}
                    <p className="text-lg font-medium">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(product.cosmeticPrice)}
                    </p>
                    {/* <p className="text-sm text-muted-foreground">
                      {product.cosmeticBenefit}
                    </p> */}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 p-4">
                  <Button className="w-full bg-rose-300 text-black hover:bg-rose-400">
                    Add to Cart
                  </Button>
                  <Button variant="link" className="text-black">
                    Learn More
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-gray-600">No recommended products found.</p>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between border-t pt-6">
        <div className="flex gap-4">
          <Button variant="default" className="bg-zinc-800 hover:bg-zinc-700">
            Add All to Cart
          </Button>
          <Button variant="outline" className="border-zinc-800">
            Save Routine
          </Button>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" size="sm" className="flex gap-2">
            <Printer className="size-4" />
            Print
          </Button>
          <Button variant="ghost" size="sm" className="flex gap-2">
            <Mail className="size-4" />
            Email
          </Button>
        </div>
      </div>
    </Card>
  )
}
