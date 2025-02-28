import React from 'react'
import { motion } from 'framer-motion'

const topics = [
  { id: 1, name: 'All Topics', isActive: true },
  { id: 2, name: 'Skincare Education', isActive: false },
  { id: 3, name: 'Ingredient Guide', isActive: false },
  { id: 4, name: 'Routine Building', isActive: false },
  { id: 5, name: 'Skin Concerns', isActive: false },
  { id: 6, name: 'Expert Advice', isActive: false }
]

const TopicTags: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full overflow-x-auto py-6"
    >
      <div className="flex flex-wrap justify-center gap-3">
        {topics.map((topic, index) => (
          <motion.button
            key={topic.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 ${
              topic.isActive
                ? 'bg-[#3A4D39] text-white shadow-md'
                : 'bg-white text-[#3A4D39] hover:bg-[#D1E2C4] hover:shadow-md'
            }`}
          >
            {topic.name}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export default TopicTags
