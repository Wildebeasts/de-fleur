import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

interface Feedback {
  id: string
  customerId: string
  customerName: string | null
  content: string | null
  rating: number
}

interface ProductDescriptionProps {
  description: string
  features: Array<{
    icon: string
    title: string
    description: string
  }>
  ingredients?: string
  instructions?: string
  feedbacks?: Feedback[]
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({
  description,
  features,
  ingredients,
  instructions,
  feedbacks = []
}) => {
  const [activeTab, setActiveTab] = useState('description')

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'instructions', label: 'How to Use' },
    { id: 'reviews', label: 'Reviews' }
  ]

  // Calculate average rating
  const averageRating = feedbacks.length
    ? feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) /
      feedbacks.length
    : 0

  return (
    <div className="mt-16 w-full">
      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`pb-4 text-base font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-b-2 border-[#3A4D39] text-[#3A4D39]'
                  : 'text-gray-500 hover:text-[#3A4D39]'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === 'description' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-700"
          >
            <p className="mb-8 text-base leading-relaxed">
              {description || 'No description available.'}
            </p>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="mr-4 size-12 object-contain"
                  />
                  <div>
                    <h3 className="mb-2 text-lg font-medium text-[#3A4D39]">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'ingredients' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-700"
          >
            <p className="whitespace-pre-line text-base leading-relaxed">
              {ingredients || 'Ingredients information not available.'}
            </p>
          </motion.div>
        )}

        {activeTab === 'instructions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-700"
          >
            <p className="whitespace-pre-line text-base leading-relaxed">
              {instructions || 'Usage instructions not available.'}
            </p>
          </motion.div>
        )}

        {activeTab === 'reviews' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-700"
          >
            <div className="mb-8">
              <h3 className="mb-2 text-xl font-medium text-[#3A4D39]">
                Customer Reviews
              </h3>
              <div className="flex items-center">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      className={`${
                        star <= Math.round(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {averageRating.toFixed(1)} out of 5 ({feedbacks.length}{' '}
                  {feedbacks.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>

            {feedbacks.length > 0 ? (
              <div className="space-y-6">
                {feedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="border-b border-gray-200 pb-6"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex size-10 items-center justify-center rounded-full bg-[#3A4D39]/20 font-medium text-[#3A4D39]">
                          {feedback.customerName?.charAt(0) || 'U'}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {feedback.customerName || 'Anonymous User'}
                          </p>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={16}
                                className={`${
                                  star <= feedback.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">
                      {feedback.content || 'No comment provided.'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                No reviews yet. Be the first to review this product!
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ProductDescription
