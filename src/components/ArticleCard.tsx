import React from 'react'

interface ArticleCardProps {
  imageSrc: string
  category: string
  readTime: string
  title: string
  authorImageSrc: string
  authorName: string
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  imageSrc,
  category,
  readTime,
  title,
  authorImageSrc,
  authorName
}) => {
  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <div className="relative overflow-hidden">
        <img
          loading="lazy"
          src={imageSrc}
          alt={`Article about ${title}`}
          className="aspect-[1.5] w-full object-cover transition-transform duration-300 group-hover:scale-110"
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

        <div className="mt-6 flex items-center gap-3">
          <img
            loading="lazy"
            src={authorImageSrc}
            alt={`Author ${authorName}`}
            className="size-10 rounded-full object-cover"
          />
          <span className="text-sm text-[#3A4D39]/80">By {authorName}</span>
        </div>
      </div>
    </article>
  )
}

export default ArticleCard
