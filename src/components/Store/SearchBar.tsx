/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react'
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { debounce } from 'lodash' // Make sure to install: npm install lodash @types/lodash

interface SearchBarProps {
  placeholder: string
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder }) => {
  const navigate = useNavigate()
  const search = useSearch({ from: '/shop' })
  const [searchTerm, setSearchTerm] = useState('')

  const placeholders = [
    'Search for skincare products...',
    "Try 'Vitamin C Serum'",
    'Search by ingredient...',
    'Looking for sunscreen?',
    'Find your perfect moisturizer'
  ]

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      if (term.trim()) {
        navigate({
          to: '/shop',
          search: { ...search, name: term.trim() }
        })
      }
    }, 2000), // 2 seconds debounce
    [navigate, search]
  )

  // Effect to trigger debounced search when searchTerm changes
  useEffect(() => {
    if (searchTerm.trim()) {
      debouncedSearch(searchTerm)
    }

    // Cleanup function to cancel debounced call if component unmounts
    return () => {
      debouncedSearch.cancel()
    }
  }, [searchTerm, debouncedSearch])

  // Immediate search on form submit
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Cancel any pending debounced searches
      debouncedSearch.cancel()

      // Navigate immediately
      navigate({
        to: '/shop',
        search: { ...search, name: searchTerm.trim() }
      })
    }
  }

  return (
    <div className="flex w-full flex-col max-md:max-w-full">
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onChange={(e) => {
          setSearchTerm(e.target.value)
        }}
        onSubmit={handleSearch}
      />
    </div>
  )
}

export default SearchBar
