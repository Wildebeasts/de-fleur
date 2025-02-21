'use client'

import React from 'react'
import { motion } from 'framer-motion'

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
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100/50 px-36 max-md:px-5"
      role="banner"
    >
      {/* Decorative elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute left-0 top-0 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D1E2C4] blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
        className="absolute right-0 top-1/2 size-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#A7C4BC] blur-3xl"
      />

      {/* Leaf decorations */}
      <LeafDecoration className="absolute left-10 top-20 size-16 rotate-45 text-[#739072]/20" />
      <LeafDecoration className="absolute bottom-20 right-10 size-20 -rotate-12 text-[#739072]/15" />
      <LeafDecoration className="absolute left-1/4 top-3/4 size-12 rotate-90 text-[#739072]/25" />

      <div className="relative w-full px-4">
        <div className="py-24 max-md:max-w-full">
          <div className="flex gap-5 max-md:flex-col">
            <motion.div
              className="w-6/12 max-md:ml-0 max-md:w-full"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <article className="flex size-full flex-col items-start justify-center self-stretch pr-8 max-md:mt-10 max-md:max-w-full">
                <h1 className="z-0 -mt-1 font-inter text-9xl leading-[8rem] text-[#3A4D39] max-md:max-w-full max-md:text-4xl max-md:leading-10">
                  Natural Beauty, Elevated Care
                </h1>
                <p className="mt-14 text-3xl leading-8 text-[#3A4D39]/80 max-md:mt-10 max-md:max-w-full">
                  Discover our collection of premium skincare products made with
                  natural ingredients.
                </p>
                <motion.div
                  className="mt-11 flex flex-col items-start self-stretch text-xl max-md:mt-10 max-md:max-w-full max-md:pr-5"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    className="group relative z-0 overflow-hidden rounded-full bg-gradient-to-r from-[#739072] via-[#86A789] to-[#739072] px-12 py-4 text-lg font-medium tracking-wide text-white shadow-[0_2px_20px_rgba(115,144,114,0.25)] transition-all duration-300 hover:shadow-[0_2px_30px_rgba(115,144,114,0.35)] focus:outline-none focus:ring-2 focus:ring-[#739072]/50 focus:ring-offset-2 max-md:px-8 max-md:py-4"
                    aria-label="Shop Now"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Shop Now
                      <svg
                        className="size-5 transition-transform duration-300 group-hover:translate-x-1"
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
              className="ml-5 w-6/12 max-md:ml-0 max-md:w-full"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            >
              <div className="flex size-full items-center justify-end max-md:mt-10 max-md:max-w-full">
                <motion.img
                  loading="lazy"
                  src={imageSrc}
                  alt="Natural beauty products showcase"
                  className="aspect-[1.04] w-4/5 rounded-2xl object-contain max-md:max-w-full"
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
