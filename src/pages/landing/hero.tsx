'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'

interface NaturalBeautyHeroProps {
  imageSrc?: string
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

export const NaturalBeautyHero: React.FC<NaturalBeautyHeroProps> = ({
  imageSrc = 'https://cdn.builder.io/api/v1/image/assets/TEMP/215c624340e556fbcd16e816db52aedece9a2752bea4f7c4b8cd0a53c4e2aa07'
}) => {
  const navigate = useNavigate()

  const handleShopNow = () => {
    navigate({ to: '/shop' })
  }

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100/50 px-8 py-10 max-md:px-5 sm:px-12 md:px-20 lg:px-36"
      role="banner"
    >
      {/* Decorative elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute left-0 top-0 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D1E2C4] blur-3xl sm:size-64 md:size-80 lg:size-96"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
        className="absolute right-0 top-1/2 size-48 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#A7C4BC] blur-3xl sm:size-64 md:size-80 lg:size-96"
      />

      {/* Leaf decorations - hidden on small screens */}
      <LeafDecoration className="absolute left-10 top-20 hidden size-8 rotate-45 text-[#739072]/20 sm:block sm:size-12 md:size-16" />
      <LeafDecoration className="absolute bottom-20 right-10 hidden size-10 -rotate-12 text-[#739072]/15 sm:block sm:size-16 md:size-20" />
      <LeafDecoration className="absolute left-1/4 top-3/4 hidden size-8 rotate-90 text-[#739072]/25 sm:block sm:size-10 md:size-12" />

      <div className="relative w-full px-4">
        <div className="py-8 max-md:max-w-full sm:py-12 md:py-16 lg:py-24">
          <div className="flex flex-col gap-5 md:flex-row">
            <motion.div
              className="w-full md:w-6/12"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <article className="flex size-full flex-col items-start justify-center self-stretch max-md:max-w-full md:pr-8">
                <h1 className="z-0 max-w-full font-inter text-4xl leading-tight text-[#3A4D39] sm:text-5xl md:text-6xl md:leading-tight lg:text-7xl lg:leading-[8rem] xl:text-9xl">
                  Natural Beauty, Elevated Care
                </h1>
                <p className="mt-6 max-w-full text-lg leading-relaxed text-[#3A4D39]/80 sm:mt-8 sm:text-xl md:mt-10 md:text-2xl lg:mt-14 lg:text-3xl">
                  Discover our collection of premium skincare products made with
                  natural ingredients.
                </p>
                <motion.div
                  className="mt-6 flex max-w-full flex-col items-start self-stretch sm:mt-8 md:mt-10 lg:mt-11"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    className="group relative z-0 w-full overflow-hidden rounded-full bg-gradient-to-r from-[#739072] via-[#86A789] to-[#739072] px-8 py-3 text-base font-medium tracking-wide text-white shadow-[0_2px_20px_rgba(115,144,114,0.25)] transition-all duration-300 hover:shadow-[0_2px_30px_rgba(115,144,114,0.35)] focus:outline-none focus:ring-2 focus:ring-[#739072]/50 focus:ring-offset-2 sm:w-auto sm:px-10 sm:py-4 sm:text-lg md:px-12"
                    aria-label="Shop Now"
                    onClick={handleShopNow}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Shop Now
                      <svg
                        className="size-4 transition-transform duration-300 group-hover:translate-x-1 sm:size-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14m-7-7 7 7-7 7" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-[#86A789] via-[#9CB69C] to-[#739072] opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
                  </button>
                </motion.div>
              </article>
            </motion.div>
            <motion.div
              className="mt-10 w-full md:ml-5 md:mt-0 md:w-6/12"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            >
              <div className="flex size-full items-center justify-center md:justify-end">
                <motion.img
                  loading="lazy"
                  src={imageSrc}
                  alt="Natural beauty products showcase"
                  className="aspect-[1.04] w-full rounded-2xl object-contain sm:w-4/5"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NaturalBeautyHero
