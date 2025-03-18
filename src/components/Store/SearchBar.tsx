/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { debounce } from 'lodash'
import { Search } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder }) => {
  const navigate = useNavigate()
  const search = useSearch({ from: '/shop' })
  const [searchTerm, setSearchTerm] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const placeholders = [
    'Search for skincare products...',
    "Try 'Vitamin C Serum'",
    'Search by ingredient...',
    'Looking for sunscreen?',
    'Find your perfect moisturizer'
  ]

  // Randomly select a placeholder
  const randomPlaceholder =
    placeholder || placeholders[Math.floor(Math.random() * placeholders.length)]

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      console.log('Debounced search with term:', term)
      if (term.trim()) {
        navigate({
          to: '/shop',
          search: { ...search, name: term.trim() }
        })
      } else {
        console.log('Empty search term detected in debounce')
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
    console.log('Search term changed:', searchTerm)
    debouncedSearch(searchTerm)

    // Cleanup function to cancel debounced call if component unmounts
    return () => {
      debouncedSearch.cancel()
    }
  }, [searchTerm, debouncedSearch])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted with term:', searchTerm)

    // Cancel any pending debounced searches
    debouncedSearch.cancel()

    // Process the search
    if (searchTerm.trim()) {
      navigate({
        to: '/shop',
        search: { ...search, name: searchTerm.trim() }
      })
    } else {
      console.log('Empty search term detected in submit')
      navigate({
        to: '/shop',
        search: {}
      })
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
          <input
            type="text"
            className="vanish-input w-full bg-transparent outline-none placeholder:text-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={randomPlaceholder}
          />
          {searchTerm && (
            <button
              type="button"
              className="ml-2 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setSearchTerm('')
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
