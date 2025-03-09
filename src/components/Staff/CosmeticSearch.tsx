import React, { useState } from 'react'

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

  return (
    <div className="sticky top-20 z-10 mb-4">
      <input
        type="text"
        placeholder="Search for cosmetics..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-[#3A4D39] focus:ring-[#3A4D39]"
      />
    </div>
  )
}

export default CosmeticSearch
