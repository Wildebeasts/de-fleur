import React from 'react'
import { motion } from 'framer-motion'

const FeaturedArticle: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full overflow-hidden rounded-2xl bg-white p-8 shadow-sm"
    >
      <div className="flex flex-col gap-8 lg:flex-row">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-1 flex-col justify-center space-y-6"
        >
          <span className="inline-flex items-center rounded-full bg-[#D1E2C4] px-4 py-2 text-sm font-medium text-[#3A4D39]">
            Featured Article
          </span>

          <h1 className="text-4xl font-semibold text-[#3A4D39] lg:text-5xl">
            The Science Behind Double Cleansing: Why Your Skin Needs It
          </h1>

          <div className="flex items-center gap-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/441ca923cee310c8076722d1a9abb55b57d8dcf4d1deed06491541eec106ff85"
              alt="Dr. Sarah Chen"
              className="size-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-[#3A4D39]">Dr. Sarah Chen</p>
              <p className="text-sm text-[#3A4D39]/70">
                Posted on March 15, 2025 · 8 min read
              </p>
            </div>
          </div>

          <p className="text-lg text-[#3A4D39]/80">
            Discover why dermatologists recommend double cleansing and how this
            Japanese skincare technique can transform your routine.
          </p>

          <div className="flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full bg-[#3A4D39] px-8 py-3 text-white shadow-lg transition-colors hover:bg-[#4A5D49]"
            >
              Read Article
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-full border border-[#3A4D39] px-8 py-3 text-[#3A4D39] transition-colors hover:bg-[#3A4D39] hover:text-white"
            >
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
              Listen
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative flex-1"
        >
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/b53f320c09a1cf932543d439e620cac3a712db929ceee7c20c2a425f373fff39"
            alt="Double cleansing skincare products"
            className="size-full rounded-xl object-cover"
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#3A4D39]/10 to-transparent" />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default FeaturedArticle
