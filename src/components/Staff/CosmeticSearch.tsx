import React, { useState } from 'react'
import { PlaceholdersAndVanishInput } from '../ui/placeholders-and-vanish-input'

interface CosmeticSearchProps {
  onSearch: (query: string) => void
}

const CosmeticSearch: React.FC<CosmeticSearchProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch(query) // Trigger search update in StaffProductGrid
  }

  const placeholders = [
    'Search for skincare products...',
    "Try 'Vitamin C Serum'",
    'Search by name...',
    'Looking for sunscreen?',
    'Find your perfect moisturizer'
  ]

  return (
    <div className="sticky top-20 z-10 mb-4">
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onChange={handleSearchChange}
        onSubmit={(e) => {
          e.preventDefault()
          searchQuery
          // Handle search submission
        }}
      />
    </div>
  )
}

export default CosmeticSearch
