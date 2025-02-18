import React from 'react'

interface Tag {
  id: string
  name: string
}

interface PopularTagsProps {
  tags: Tag[]
}

const PopularTags: React.FC<PopularTagsProps> = ({ tags }) => {
  return (
    <div className="mt-4 flex flex-wrap gap-4 pr-20 text-sm text-zinc-800 max-md:pr-5">
      <div className="my-auto leading-none">Popular:</div>
      {tags.map((tag) => (
        <button
          key={tag.id}
          className="rounded-full bg-gray-200 px-3 pb-3 pt-1.5"
          aria-label={`Search for ${tag.name}`}
        >
          {tag.name}
        </button>
      ))}
    </div>
  )
}

export default PopularTags
