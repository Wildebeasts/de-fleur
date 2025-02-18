import React from 'react'
import { motion } from 'framer-motion'
import { ChevronRightIcon } from '@heroicons/react/24/solid'

const Breadcrumb: React.FC = () => {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex w-full items-center gap-2 py-1 text-sm max-md:max-w-full">
        <motion.li
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <a
            href="/"
            className="font-medium text-[#3A4D39] transition-colors hover:text-[#4A5D49]"
          >
            Home
          </a>
        </motion.li>
        <li aria-hidden="true">
          <ChevronRightIcon className="size-4 text-[#3A4D39]/60" />
        </li>
        <motion.li
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <a
            href="/shop"
            className="font-medium text-[#3A4D39] transition-colors hover:text-[#4A5D49]"
          >
            Shop
          </a>
        </motion.li>
        <li aria-hidden="true">
          <ChevronRightIcon className="size-4 text-[#3A4D39]/60" />
        </li>
        <motion.li
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <span className="font-medium text-[#739072]">Serums</span>
        </motion.li>
      </ol>
    </nav>
  )
}

export default Breadcrumb
