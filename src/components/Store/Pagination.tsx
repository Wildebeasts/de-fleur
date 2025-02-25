import React from 'react'
import { motion } from 'framer-motion'

interface PaginationProps {
  currentPage: number
  totalPages: number
  setCurrentPage: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  setCurrentPage
}) => {
  // Handle page change
  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-8 flex justify-center gap-2"
      aria-label="Pagination"
    >
      <motion.button
        onClick={() => changePage(currentPage - 1)}
        disabled={currentPage === 1}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="rounded-full p-2 text-gray-500 transition-colors hover:text-gray-700"
        aria-label="Previous page"
      >
        ←
      </motion.button>
      {/* {[1, 2, 3].map((page) => (
        <motion.button
          key={page}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`rounded-full px-4 py-2 ${
            page === 1
              ? 'bg-[#3A4D39] text-white'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {page}
        </motion.button>
      ))} */}

      {/* Page Numbers */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <motion.button
          key={page}
          onClick={() => changePage(page)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`rounded-full px-4 py-2 ${
            currentPage === page
              ? 'bg-[#3A4D39] text-white'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {page}
        </motion.button>
      ))}

      <motion.button
        onClick={() => changePage(currentPage + 1)}
        disabled={currentPage === totalPages}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="rounded-full p-2 text-gray-500 transition-colors hover:text-gray-700"
        aria-label="Next page"
      >
        →
      </motion.button>
    </motion.nav>
  )
}

export default Pagination
