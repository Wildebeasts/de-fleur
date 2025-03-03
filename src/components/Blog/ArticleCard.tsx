import { BlogResponse } from '@/lib/types/Blog'
import React from 'react'

interface ArticleCardProps {
  blog: BlogResponse
}

const ArticleCard: React.FC<ArticleCardProps> = ({ blog }) => {
  return (
    <article className="group h-full overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="relative aspect-[1.5] overflow-hidden">
        <img
          src="/placeholder-blog-image.jpg"
          alt={blog.title}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4">
          <span className="rounded-full bg-[#D1E2C4] px-3 py-1 text-sm font-medium text-[#3A4D39]">
            {blog.tags[0]?.name || 'Uncategorized'}
          </span>
          <span className="text-sm text-[#3A4D39]/70">5 min read</span>
        </div>

        <h3 className="mt-4 text-xl font-semibold text-[#3A4D39] group-hover:text-[#4A5D49]">
          {blog.title}
        </h3>

        <p className="mt-3 text-sm text-[#3A4D39]/80">{blog.shortenContent}</p>

        <div className="mt-6 flex items-center gap-3">
          <img
            src="/placeholder-author-image.jpg"
            alt={`Author ${blog.staffName}`}
            className="size-10 rounded-full object-cover"
          />
          <span className="text-sm text-[#3A4D39]/80">By {blog.staffName}</span>
        </div>
      </div>
    </article>
  )
}

export default ArticleCard
