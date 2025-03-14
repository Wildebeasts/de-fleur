import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageCarouselProps {
  images: string[]
  onImageChange?: (image: string) => void
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  onImageChange
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % images.length
    setCurrentIndex(newIndex)
    onImageChange?.(images[newIndex])
  }

  const handlePrev = () => {
    const newIndex = (currentIndex - 1 + images.length) % images.length
    setCurrentIndex(newIndex)
    onImageChange?.(images[newIndex])
  }

  return (
    <div className="relative mt-4 w-full">
      <div className="overflow-hidden rounded-lg">
        <div className="relative aspect-square w-full">
          {images.length > 0 && (
            <motion.img
              key={images[currentIndex]}
              src={images[currentIndex]}
              alt={`Product view ${currentIndex + 1}`}
              className="size-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-1.5 shadow-md backdrop-blur-sm transition-colors hover:bg-[#3A4D39] hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-1.5 shadow-md backdrop-blur-sm transition-colors hover:bg-[#3A4D39] hover:text-white"
          >
            <ChevronRight size={20} />
          </button>

          <div className="mt-2 flex justify-center gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                className={`h-1.5 w-6 rounded-full ${
                  index === currentIndex ? 'bg-[#3A4D39]' : 'bg-gray-300'
                }`}
                onClick={() => {
                  setCurrentIndex(index)
                  onImageChange?.(images[index])
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ImageCarousel
