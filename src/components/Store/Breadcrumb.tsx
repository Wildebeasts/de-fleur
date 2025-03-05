import React from 'react'
import { motion } from 'framer-motion'
import { ChevronRightIcon } from '@heroicons/react/24/solid'

const Breadcrumb: React.FC = () => {
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' }
  ]

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex w-full items-center gap-2 py-1 text-sm max-md:max-w-full">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.name}>
            <motion.li
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <a
                href={crumb.href}
                className={`font-medium ${index === breadcrumbs.length - 1 ? 'text-[#739072]' : 'text-[#3A4D39] transition-colors hover:text-[#4A5D49]'}`}
              >
                {crumb.name}
              </a>
            </motion.li>
            {index < breadcrumbs.length - 1 && (
              <li aria-hidden="true">
                <ChevronRightIcon className="size-4 text-[#3A4D39]/60" />
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumb
