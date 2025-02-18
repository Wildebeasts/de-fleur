import React from 'react'
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input'

interface SearchBarProps {
  placeholder: string
}

// eslint-disable-next-line no-empty-pattern
const SearchBar: React.FC<SearchBarProps> = ({}) => {
  const placeholders = [
    'Search for skincare products...',
    "Try 'Vitamin C Serum'",
    'Search by ingredient...',
    'Looking for sunscreen?',
    'Find your perfect moisturizer'
  ]

  return (
    <div className="flex w-full flex-col max-md:max-w-full">
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onChange={() => {
          // Handle onChange if needed
        }}
        onSubmit={(e) => {
          e.preventDefault()
          // Handle search submission
        }}
      />
    </div>
  )
}

export default SearchBar
