import React from 'react'
import { motion } from 'framer-motion'

const NewsletterSignup: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full flex-col items-center justify-center rounded-2xl bg-[#D1E2C4] px-8 py-16 text-center"
    >
      <h2 className="text-3xl font-semibold text-[#3A4D39]">
        Stay Glowing & Informed
      </h2>

      <p className="mt-4 max-w-xl text-base text-[#3A4D39]/80">
        Join our community to receive expert skincare tips, exclusive content,
        and early access to new articles.
      </p>

      <form className="mt-8 flex w-full max-w-md gap-4">
        <input
          type="email"
          placeholder="Enter your email"
          className="flex-1 rounded-full border border-gray-200 bg-white px-6 py-3 text-[#3A4D39] outline-none focus:border-[#3A4D39] focus:ring-2 focus:ring-[#3A4D39]/20"
          required
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="rounded-full bg-[#3A4D39] px-8 py-3 font-medium text-white transition-colors hover:bg-[#4A5D49]"
        >
          Subscribe
        </motion.button>
      </form>

      <p className="mt-4 text-sm text-[#3A4D39]/60">
        By subscribing, you agree to our Privacy Policy and Terms of Service
      </p>
    </motion.div>
  )
}

export default NewsletterSignup
