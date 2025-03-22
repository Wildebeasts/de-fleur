/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuizResult } from '@/lib/context/QuizResultContext'
import { useNavigate } from '@tanstack/react-router'
import {
  Loader2,
  ChevronRight,
  Share2,
  Copy,
  ShoppingBag,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import cartApi from '@/lib/services/cartApi'

const MobileQuizResult: React.FC = () => {
  const { quizResults, isLoading } = useQuizResult()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('routine')
  const [isAddingToCart, setIsAddingToCart] = useState<{
    [key: string]: boolean
  }>({})

  // Format currency function
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  // Calculate total price for all unique products
  const calculateTotalPrice = () => {
    const uniqueProducts = new Map()

    quizResults?.forEach((routine) => {
      routine?.routineSteps?.forEach((step) => {
        if (step?.cosmeticId && !uniqueProducts.has(step.cosmeticId)) {
          uniqueProducts.set(step.cosmeticId, step)
        }
      })
    })

    return Array.from(uniqueProducts.values()).reduce(
      (sum, step) => sum + (Number(step?.cosmeticPrice) || 0),
      0
    )
  }

  const handleAddToCart = async (cosmeticId: string, name: string) => {
    try {
      setIsAddingToCart((prev) => ({ ...prev, [cosmeticId]: true }))

      const response = await cartApi.addToCart(cosmeticId, 1)

      if (response.data.isSuccess) {
        toast.success(`${name} added to cart!`)
      } else {
        toast.error(response.data.message || 'Failed to add item to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Unable to add to cart')
    } finally {
      setIsAddingToCart((prev) => ({ ...prev, [cosmeticId]: false }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <Loader2 className="size-10 animate-spin text-[#3A4D39]" />
        <p className="mt-4 text-[#3A4D39]">Loading your skin profile...</p>
      </div>
    )
  }

  if (!quizResults || quizResults.length === 0) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
        <div className="rounded-xl bg-rose-50 p-6 shadow-sm">
          <h2 className="text-xl font-medium text-[#3A4D39]">
            No results found
          </h2>
          <p className="mt-2 text-[#3A4D39]/80">
            We don&apos;t have your skin profile data yet. Please take the quiz
            to get personalized recommendations.
          </p>
          <Button
            className="mt-4 bg-[#3A4D39] hover:bg-[#4A5D49]"
            onClick={() => navigate({ to: '/quiz' })}
          >
            Take Skin Quiz
          </Button>
        </div>
      </div>
    )
  }

  // Extract all unique products
  const allProducts = Array.from(
    new Map(
      quizResults
        .flatMap((result) => result.routineSteps || [])
        .map((p) => [p.cosmeticId, p])
    ).values()
  )

  return (
    <div className="bg-neutral-50 pb-20">
      {/* Hero section with profile summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-gradient-to-b from-[#A7C4BC] to-[#D1E2C4] px-4 pb-10 pt-6"
      >
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#3A4D39]">
            Your Skin Profile
          </h1>
          <button
            onClick={() => toast.success('Profile link copied!')}
            className="rounded-full p-2 active:bg-white/20"
          >
            <Share2 className="size-5 text-[#3A4D39]" />
          </button>
        </div>

        <div className="mt-3 rounded-xl bg-white/90 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-[#3A4D39]/70">Skin Type</div>
              <div className="font-medium text-[#3A4D39]">
                {quizResults[0]?.skinType?.name || 'Combination'}
              </div>
            </div>
            <div>
              <div className="text-sm text-[#3A4D39]/70">Primary Concern</div>
              <div className="font-medium text-[#3A4D39]">
                {(() => {
                  const skinType = quizResults[0]?.skinType
                  if (!skinType) return 'Hydration'

                  if (skinType.isDry) return 'Dryness'
                  if (skinType.isSensitive) return 'Sensitivity'
                  if (skinType.isUneven) return 'Pigmentation'
                  if (skinType.isWrinkle) return 'Anti-aging'
                  return 'Hydration'
                })()}
              </div>
            </div>
          </div>

          <div className="mt-3 text-sm text-[#3A4D39]/70">
            Budget Estimate
            <span className="ml-2 font-medium text-[#3A4D39]">
              {formatCurrency(calculateTotalPrice())}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tabs for different sections */}
      <Tabs
        defaultValue="routine"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="sticky top-0 z-10 grid w-full grid-cols-3 bg-white">
          <TabsTrigger value="routine">Routine</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="tips">Tips</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Routine Tab */}
            <TabsContent value="routine" className="p-4">
              <h2 className="text-lg font-medium text-[#3A4D39]">
                Your Daily Routine
              </h2>

              {quizResults.map((routine: any, index: number) => (
                <div key={index} className="mt-4">
                  <h3 className="font-medium text-[#3A4D39]">
                    {routine.routineName || 'Morning Routine'}
                  </h3>

                  <div className="mt-2 space-y-3">
                    {routine.routineSteps?.map(
                      (step: any, stepIndex: number) => (
                        <motion.div
                          key={stepIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: stepIndex * 0.1 }}
                          className="rounded-lg bg-white p-3 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Badge className="mr-2 bg-[#E8F3D6] px-2 py-1 text-xs font-normal text-[#3A4D39]">
                                Step {stepIndex + 1}
                              </Badge>
                              <h4 className="font-medium text-[#3A4D39]">
                                {step.routineStep || 'Apply Product'}
                              </h4>
                            </div>
                          </div>

                          <p className="mt-2 text-sm text-[#3A4D39]/80">
                            {step.cosmeticName}
                          </p>

                          <p className="mt-1 text-xs text-[#3A4D39]/60">
                            {step.description ||
                              'Apply evenly to cleansed skin.'}
                          </p>
                        </motion.div>
                      )
                    )}
                  </div>
                </div>
              ))}

              <div className="mt-6 rounded-lg bg-[#E8F3D6]/60 p-4 shadow-sm">
                <h3 className="font-medium text-[#3A4D39]">Routine Stats</h3>
                <div className="mt-2 space-y-1 text-sm text-[#3A4D39]/80">
                  <p>Total Time: 15-20 minutes daily</p>
                  <p>Difficulty Level: Moderate</p>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-[#3A4D39] text-[#3A4D39]"
                  onClick={() => {
                    toast.success('Routine copied to clipboard!')
                  }}
                >
                  <Copy className="size-4" />
                  Save Routine
                </Button>
              </div>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-[#3A4D39]">
                  Recommended Products
                </h2>
                <button
                  className="flex items-center text-sm text-[#3A4D39]"
                  onClick={() => navigate({ to: '/shop' })}
                >
                  Shop All <ChevronRight className="size-4" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {allProducts.map((product, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="overflow-hidden rounded-lg bg-white shadow-sm"
                  >
                    <div className="flex">
                      <div
                        className="size-28 shrink-0 cursor-pointer"
                        onClick={() =>
                          navigate({
                            to: '/shopDetails',
                            search: { productId: product.cosmeticId }
                          })
                        }
                      >
                        <img
                          src={
                            product.cosmeticImageUrl ||
                            'https://placehold.co/200x200/E8F3D6/3A4D39?text=Product'
                          }
                          className="size-full object-cover"
                          alt={product.cosmeticName}
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-3">
                        <div>
                          <div
                            className="cursor-pointer font-medium text-[#3A4D39]"
                            onClick={() =>
                              navigate({
                                to: '/shopDetails',
                                search: { productId: product.cosmeticId }
                              })
                            }
                          >
                            {product.cosmeticName}
                          </div>
                          <div className="mt-1 text-sm text-[#3A4D39]/80">
                            {formatCurrency(product.cosmeticPrice)}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 w-full border-[#3A4D39] text-xs text-[#3A4D39]"
                          disabled={isAddingToCart[product.cosmeticId]}
                          onClick={() =>
                            handleAddToCart(
                              product.cosmeticId,
                              product.cosmeticName
                            )
                          }
                        >
                          {isAddingToCart[product.cosmeticId] ? (
                            <Loader2 className="mr-2 size-3 animate-spin" />
                          ) : (
                            <ShoppingBag className="mr-2 size-3" />
                          )}
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                  className="bg-[#3A4D39] hover:bg-[#4A5D49]"
                  onClick={() => {
                    // Add all products to cart
                    toast.success(
                      'Functionality to add all products coming soon'
                    )
                  }}
                >
                  Add All to Cart
                </Button>
              </div>
            </TabsContent>

            {/* Tips Tab */}
            <TabsContent value="tips" className="p-4">
              <h2 className="text-lg font-medium text-[#3A4D39]">
                Skincare Tips
              </h2>

              <div className="mt-4 space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-white p-4 shadow-sm"
                >
                  <h3 className="font-medium text-[#3A4D39]">
                    For Your Skin Type
                  </h3>
                  <p className="mt-2 text-sm text-[#3A4D39]/80">
                    {quizResults[0]?.skinType?.name === 'Oily'
                      ? 'Use oil-free, non-comedogenic products and gentle exfoliation 2-3 times weekly to control excess sebum.'
                      : quizResults[0]?.skinType?.name === 'Dry'
                        ? 'Focus on hydration with ceramide-rich moisturizers and avoid harsh, drying ingredients like alcohol and fragrance.'
                        : 'Balance your routine with gentle cleansers and targeted treatments for different areas of your face.'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-lg bg-white p-4 shadow-sm"
                >
                  <h3 className="font-medium text-[#3A4D39]">
                    Application Order
                  </h3>
                  <p className="mt-2 text-sm text-[#3A4D39]/80">
                    Always apply products from thinnest to thickest consistency:
                    cleansers, toners, serums, treatments, moisturizers, and
                    finally SPF (during the day).
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-lg bg-white p-4 shadow-sm"
                >
                  <h3 className="font-medium text-[#3A4D39]">
                    Lifestyle Factors
                  </h3>
                  <p className="mt-2 text-sm text-[#3A4D39]/80">
                    Stay hydrated, maintain a balanced diet rich in
                    antioxidants, and protect your skin from UV exposure daily
                    to complement your skincare routine.
                  </p>
                </motion.div>
              </div>

              <div
                className="mt-6 cursor-pointer rounded-lg bg-[#E8F3D6] p-4 shadow-sm"
                onClick={() => navigate({ to: '/blog' })}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-[#3A4D39]">Read More Tips</h3>
                  <ArrowRight className="size-4 text-[#3A4D39]" />
                </div>
                <p className="mt-1 text-sm text-[#3A4D39]/80">
                  Check our blog for more skincare advice and tutorials
                </p>
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  )
}

export default MobileQuizResult
