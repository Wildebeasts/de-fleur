import React, { useState } from 'react'
import { motion } from 'framer-motion'
import ImageCarousel from '@/components/Store/ImageCarousel'

interface ProductImageProps {
  imageUrl?: string
  cosmeticImages?: Array<{ id: string; imageUrl: string }>
}

const ProductImage: React.FC<ProductImageProps> = ({
  imageUrl,
  cosmeticImages = []
}) => {
  const [selectedImage, setSelectedImage] = useState(
    imageUrl || cosmeticImages?.[0]?.imageUrl || ''
  )
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [carouselIndex, setCarouselIndex] = useState(0)

  const handleThumbnailClick = (image: string) => {
    setSelectedImage(image)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Create an array of all available images
  const allImages = [
    ...(imageUrl ? [imageUrl] : []),
    ...(cosmeticImages?.map((img) => img.imageUrl) || [])
  ].filter(Boolean)

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // Number of thumbnails to show at once in desktop view
  const THUMBNAILS_TO_SHOW = 4

  // Calculate max index to prevent scrolling past the end
  const maxIndex = Math.max(0, allImages.length - THUMBNAILS_TO_SHOW)

  const handleNextSlide = () => {
    setCarouselIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const handlePrevSlide = () => {
    setCarouselIndex((prev) => Math.max(prev - 1, 0))
  }

  return (
    <div className="flex w-3/5 flex-col max-md:ml-0 max-md:w-full">
      <div className="relative">
        <motion.img
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          loading="lazy"
          src={
            selectedImage ||
            'https://cdn.builder.io/api/v1/image/assets/TEMP/866f03b1126b552963088927ab1354e532e4e786039d557d037f1e0378571d45'
          }
          className={`aspect-[1.03] w-full rounded-lg object-contain max-md:mt-8 max-md:max-w-full max-sm:mt-3.5 ${
            isFullscreen ? 'cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          alt="Product image"
          onClick={toggleFullscreen}
          style={{ transform: `scale(${isFullscreen ? zoomLevel : 1})` }}
          onLoad={() => setIsLoading(false)}
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-10 animate-spin rounded-full border-4 border-[#3A4D39] border-t-transparent"></div>
          </div>
        )}

        {/* Fullscreen button */}
        <button
          className="absolute right-4 top-4 rounded-full bg-white/80 p-2 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-[#3A4D39] hover:text-white"
          onClick={toggleFullscreen}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>
      </div>

      {/* Thumbnail gallery */}
      {isMobile ? (
        <ImageCarousel
          images={allImages}
          onImageChange={handleThumbnailClick}
        />
      ) : (
        <div className="relative mt-4">
          {/* Left navigation button */}
          {carouselIndex > 0 && (
            <button
              onClick={handlePrevSlide}
              className="absolute -left-4 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition-all hover:bg-[#3A4D39] hover:text-white"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          )}

          {/* Thumbnail container with animation */}
          <motion.div className="flex gap-2 overflow-hidden" initial={false}>
            <motion.div
              className="flex gap-2"
              animate={{ x: -carouselIndex * 84 }} // 84px = thumbnail width (80px) + gap (4px)
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {allImages.map((img, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative size-20 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 ${
                    selectedImage === img
                      ? 'border-[#3A4D39]'
                      : 'border-transparent'
                  }`}
                  onClick={() => handleThumbnailClick(img)}
                >
                  <img
                    src={img}
                    alt={`Product thumbnail ${index + 1}`}
                    className="size-full object-cover"
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right navigation button */}
          {carouselIndex < maxIndex && (
            <button
              onClick={handleNextSlide}
              className="absolute -right-4 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition-all hover:bg-[#3A4D39] hover:text-white"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={toggleFullscreen}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img
              src={
                selectedImage ||
                'https://cdn.builder.io/api/v1/image/assets/TEMP/866f03b1126b552963088927ab1354e532e4e786039d557d037f1e0378571d45'
              }
              alt="Product fullscreen"
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
            <button
              className="absolute right-4 top-4 rounded-full bg-white/80 p-2 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-red-500 hover:text-white"
              onClick={toggleFullscreen}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      {/* Zoom controls */}
      <div className="zoom-controls">
        <button onClick={() => setZoomLevel(Math.min(zoomLevel + 0.5, 3))}>
          +
        </button>
        <button onClick={() => setZoomLevel(Math.max(zoomLevel - 0.5, 1))}>
          -
        </button>
      </div>
    </div>
  )
}

export default ProductImage
