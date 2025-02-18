import React from 'react'
import { motion } from 'framer-motion'
import ArticleCard from '../../components/ArticleCard'

interface Article {
  imageSrc: string
  category: string
  readTime: string
  title: string
  authorImageSrc: string
  authorName: string
}

const LeafDecoration = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-4.42 3.58-8 8-8 4.42 0 8 3.58 8 8 0 4.42-3.58 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 10 7 10zm5-3c1.93 0 3.5 1.57 3.5 3.5S13.93 14 12 14s-3.5-1.57-3.5-3.5S10.07 7 12 7z" />
  </svg>
)

const articles: Article[] = [
  {
    imageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/3c72cf33389dcb1ddd7f480f0af30484b0f4f60f188c60066db61ff9f2066340?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    category: 'Skincare Tips',
    readTime: '5 min read',
    title: 'The Ultimate Guide to Double Cleansing',
    authorImageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/fc21a12e6f3a092c5368cbb8c5348c331cf29889fb8cdda0d1c7087a72c2d142?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    authorName: 'Sarah Johnson'
  },
  {
    imageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/01d49785ec54440a53dbbb94d8da4be20cddb55cef5342159a8e462e0cce3bb2?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    category: 'Ingredients',
    readTime: '4 min read',
    title: 'Understanding Natural Ingredients',
    authorImageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/a37748623acdd7822eaf569f8fd45503130d8f0707bdbb876ed17993a37599e0?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    authorName: 'Emma Davis'
  },
  {
    imageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/90f4349a4195ad2baf47b3f022fdfcb329476b744a21f4aa812060aa20087f9a?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    category: 'Routines',
    readTime: '6 min read',
    title: 'Morning Skincare Routine Steps',
    authorImageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/61bcd5de66200008ebd1abba1a2271f3e275677230fcb3e0a7468d4a3c80817f?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    authorName: 'Michael Chen'
  }
]

const ArticleSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-[#F9F5F0] px-20 py-24 max-md:px-5">
      {/* Enhanced decorative elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute right-0 top-0 size-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#D1E2C4] blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
        className="absolute bottom-0 left-0 size-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#A7C4BC] blur-3xl"
      />

      {/* Leaf decorations */}
      <LeafDecoration className="absolute left-10 top-20 size-16 rotate-45 text-[#739072]/20" />
      <LeafDecoration className="absolute bottom-20 right-10 size-20 -rotate-12 text-[#739072]/15" />
      <LeafDecoration className="absolute left-1/4 top-3/4 size-12 rotate-90 text-[#739072]/25" />

      <div className="relative flex w-full flex-col px-4 max-md:max-w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-6 text-5xl font-semibold text-[#3A4D39]">
            Latest Blogs
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-[#3A4D39]/80">
            Explore our collection of skincare tips, ingredient guides, and
            expert advice.
          </p>
        </motion.div>

        <div className="mt-16 max-md:mt-10 max-md:max-w-full">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ scale: 1.03 }}
                className="transition-shadow duration-300 hover:shadow-lg"
              >
                <ArticleCard {...article} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ArticleSection
