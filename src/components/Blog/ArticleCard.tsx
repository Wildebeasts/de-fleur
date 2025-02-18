import React from 'react'

interface ArticleCardProps {
  imageSrc: string
  category: string
  title: string
  description: string
  author: string
  readTime: string
  authorImageSrc: string
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  imageSrc,
  category,
  title,
  description,
  author,
  readTime,
  authorImageSrc
}) => {
  return (
    <article className="group h-full overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="relative aspect-[1.5] overflow-hidden">
        <img
          src={imageSrc}
          alt={title}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4">
          <span className="rounded-full bg-[#D1E2C4] px-3 py-1 text-sm font-medium text-[#3A4D39]">
            {category}
          </span>
          <span className="text-sm text-[#3A4D39]/70">{readTime}</span>
        </div>

        <h3 className="mt-4 text-xl font-semibold text-[#3A4D39] group-hover:text-[#4A5D49]">
          {title}
        </h3>

        <p className="mt-3 text-sm text-[#3A4D39]/80">{description}</p>

        <div className="mt-6 flex items-center gap-3">
          <img
            src={authorImageSrc}
            alt={`Author ${author}`}
            className="size-10 rounded-full object-cover"
          />
          <span className="text-sm text-[#3A4D39]/80">By {author}</span>
        </div>
      </div>
    </article>
  )
}

export default ArticleCard
