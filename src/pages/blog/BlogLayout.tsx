import React from 'react'
import { motion } from 'framer-motion'
import FeaturedArticle from '@/components/Blog/FeaturedArticle'
import TopicTags from '@/components/Blog/TopicTags'
import ArticleCard from '@/components/Blog/ArticleCard'
import NewsletterSignup from '@/components/Blog/NewsletterSignup'
import ExpertContributors from '@/components/Blog/ContributorCard'

const articles = [
  {
    imageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/3c72cf33389dcb1ddd7f480f0af30484b0f4f60f188c60066db61ff9f2066340',
    category: 'Ingredient Guide',
    title: 'Understanding Hyaluronic Acid: Your Hydration Hero',
    description:
      'Discover the benefits of this powerful moisturizing molecule.',
    author: 'Dr. Sarah Chen',
    readTime: '5 min read',
    authorImageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/fc21a12e6f3a092c5368cbb8c5348c331cf29889fb8cdda0d1c7087a72c2d142'
  },
  {
    imageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/3c72cf33389dcb1ddd7f480f0af30484b0f4f60f188c60066db61ff9f2066340',
    category: 'Routine Building',
    title: 'Layer Like a Pro: Building Your Perfect Routine',
    description: 'Learn the correct order to apply your skincare products.',
    author: 'Maria Garcia',
    readTime: '7 min read',
    authorImageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/fc21a12e6f3a092c5368cbb8c5348c331cf29889fb8cdda0d1c7087a72c2d142'
  },
  {
    imageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/3c72cf33389dcb1ddd7f480f0af30484b0f4f60f188c60066db61ff9f2066340',
    category: 'Success Stories',
    title: "From Acne to Clarity: Sarah's Journey",
    description: 'A real transformation story with expert insights.',
    author: 'Emma Wilson',
    readTime: '10 min read',
    authorImageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/fc21a12e6f3a092c5368cbb8c5348c331cf29889fb8cdda0d1c7087a72c2d142'
  }
]

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

const BlogLayout: React.FC = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen w-full bg-orange-50/50"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-16">
          <motion.div variants={itemVariants}>
            <FeaturedArticle />
          </motion.div>

          <motion.div variants={itemVariants}>
            <TopicTags />
          </motion.div>

          <motion.section variants={itemVariants} className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-semibold text-[#3A4D39]">
                Latest Articles
              </h2>
              <motion.a
                href="/blog/all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-[#3A4D39] underline-offset-4 hover:underline"
              >
                View All
              </motion.a>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <ArticleCard {...article} />
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.div
            variants={itemVariants}
            className="overflow-hidden rounded-2xl bg-white shadow-sm"
          >
            <NewsletterSignup />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ExpertContributors />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default BlogLayout
