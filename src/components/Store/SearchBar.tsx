/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { debounce } from 'lodash'
import { Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchBarProps {
  placeholder?: string
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder }) => {
  const navigate = useNavigate()
  const search = useSearch({ from: '/shop' })
  const [searchTerm, setSearchTerm] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [currentPlaceholder, setCurrentPlaceholder] = useState('')
  const [showPlaceholder, setShowPlaceholder] = useState(true)

  const placeholders = [
    'Search for skincare products...',
    "Try 'Vitamin C Serum'",
    'Search by ingredient...',
    'Looking for sunscreen?',
    'Find your perfect moisturizer'
  ]

  // Set initial placeholder
  useEffect(() => {
    setCurrentPlaceholder(
      placeholder ||
        placeholders[Math.floor(Math.random() * placeholders.length)]
    )
  }, [placeholder])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      if (term.trim()) {
        navigate({
          to: '/shop',
          search: { ...search, name: term.trim() }
        })
      } else {
        navigate({
          to: '/shop',
          search: {}
        })
      }
    }, 2000),
    [navigate, search]
  )

  // Effect to trigger debounced search when searchTerm changes
  useEffect(() => {
    debouncedSearch(searchTerm)
    return () => {
      debouncedSearch.cancel()
    }
  }, [searchTerm, debouncedSearch])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Cancel any pending debounced searches
    debouncedSearch.cancel()

    // Hide placeholder on submit
    setShowPlaceholder(false)

    // Process the search
    if (searchTerm.trim()) {
      navigate({
        to: '/shop',
        search: { ...search, name: searchTerm.trim() }
      })
    } else {
      navigate({
        to: '/shop',
        search: {}
      })
    }
  }

  // Reset placeholder when input is focused
  const handleFocus = () => {
    setIsFocused(true)
    if (!searchTerm) {
      setShowPlaceholder(true)
      // Change placeholder on focus
      const newPlaceholder =
        placeholders[Math.floor(Math.random() * placeholders.length)]
      setCurrentPlaceholder(newPlaceholder)
    }
  }

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`
          flex items-center rounded-full border border-gray-300 bg-white px-4 py-2 transition-all duration-300
          ${isFocused ? 'border-orange-300 shadow-md' : 'shadow-sm'}
        `}
        >
          <Search className="mr-2 size-5 text-gray-400" />

          <div className="relative flex-1">
            <input
              type="text"
              className="vanish-input w-full bg-transparent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleFocus}
              onBlur={() => setIsFocused(false)}
              placeholder=""
            />

            <AnimatePresence>
              {showPlaceholder && !searchTerm && (
                <motion.span
                  className="pointer-events-none absolute left-0 top-0 text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentPlaceholder}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {searchTerm && (
            <button
              type="button"
              className="ml-2 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setSearchTerm('')
                setShowPlaceholder(true)
                navigate({
                  to: '/shop',
                  search: {}
                })
              }}
            >
              ×
            </button>
          )}
        </div>
        <button type="submit" className="hidden">
          Search
        </button>
      </form>
    </div>
  )
}

export default SearchBar
