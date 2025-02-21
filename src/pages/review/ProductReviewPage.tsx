import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const StarRating = ({
  rating,
  setRating,
  hoverRating,
  setHoverRating
}: {
  rating: number
  setRating: (r: number) => void
  hoverRating: number
  setHoverRating: (r: number) => void
}) => {
  const categories = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className={`text-3xl ${
              star <= (hoverRating || rating)
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
          >
            ★
          </motion.button>
        ))}
      </div>
      {(hoverRating || rating) > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-medium text-[#3A4D39]"
        >
          {categories[(hoverRating || rating) - 1]}
        </motion.p>
      )}
    </div>
  )
}

const ProductReviewPage: React.FC = () => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState('')

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-orange-50/80 to-white px-4 py-16"
    >
      <div className="mx-auto max-w-3xl">
        <motion.section variants={itemVariants} className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-rose-100 px-4 py-2 text-sm text-rose-500">
            Share Your Experience
          </span>
          <h1 className="mb-4 text-4xl font-semibold text-[#3A4D39]">
            Rate & Review
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#3A4D39]/80">
            Your feedback helps others make better choices and helps us improve
          </p>
        </motion.section>

        <motion.div variants={itemVariants}>
          <Card className="border-rose-200/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#3A4D39]">Product Review</CardTitle>
              <CardDescription>
                Tell us about your experience with this product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <label className="text-sm font-medium text-[#3A4D39]">
                  Overall Rating
                </label>
                <StarRating
                  rating={rating}
                  setRating={setRating}
                  hoverRating={hoverRating}
                  setHoverRating={setHoverRating}
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-[#3A4D39]">
                  Write Your Review
                </label>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What did you like or dislike? How was your experience using this product?"
                  className="min-h-[150px] resize-none border-rose-200/50"
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-[#3A4D39]">
                  Would you recommend this product?
                </label>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-full bg-[#D1E2C4] px-6 py-2 text-[#3A4D39]"
                  >
                    Yes
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-full border border-[#3A4D39] px-6 py-2 text-[#3A4D39]"
                  >
                    No
                  </motion.button>
                </div>
              </div>

              <motion.div
                className="pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  className="w-full bg-[#3A4D39] text-white hover:bg-[#4A5D49]"
                  size="lg"
                >
                  Submit Review
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ProductReviewPage
