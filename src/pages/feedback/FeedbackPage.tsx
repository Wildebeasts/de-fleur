import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { StarFilledIcon } from '@radix-ui/react-icons'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const FeedbackPage: React.FC = () => {
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
            Your Opinion Matters
          </span>
          <h1 className="mb-4 text-4xl font-semibold text-[#3A4D39]">
            Share Your Experience
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#3A4D39]/80">
            Help us improve our products and services with your valuable
            feedback
          </p>
        </motion.section>

        <motion.div variants={itemVariants}>
          <Card className="border-rose-200/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#3A4D39]">Product Feedback</CardTitle>
              <CardDescription>
                Tell us about your experience with our products
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#3A4D39]">
                  Select Product
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="serum">Vitamin C Serum</SelectItem>
                    <SelectItem value="cream">Hydrating Cream</SelectItem>
                    <SelectItem value="cleanser">Gentle Cleanser</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#3A4D39]">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-yellow-400"
                    >
                      <StarFilledIcon className="size-8" />
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#3A4D39]">
                  Your Feedback
                </label>
                <Textarea
                  placeholder="Share your thoughts about the product..."
                  className="min-h-[150px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#3A4D39]">
                  Email (optional)
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  className="border-gray-200"
                />
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="w-full rounded-full bg-[#3A4D39] py-6 text-white hover:bg-[#4A5D49]">
                  Submit Feedback
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.section
          variants={itemVariants}
          className="mt-16 overflow-hidden rounded-2xl bg-[#D1E2C4]/30 p-8 text-center"
        >
          <h2 className="mb-4 text-2xl font-semibold text-[#3A4D39]">
            Thank You for Your Feedback
          </h2>
          <p className="text-[#3A4D39]/80">
            Your feedback helps us create better products for our community
          </p>
        </motion.section>
      </div>
    </motion.div>
  )
}

export default FeedbackPage
