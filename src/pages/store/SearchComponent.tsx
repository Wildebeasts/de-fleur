import React from 'react'
import SearchBar from '../../components/Store/SearchBar'
import PopularTags from '../../components/Store/PopularTags'

const popularTags = [
  { id: '1', name: 'Vitamin C' },
  { id: '2', name: 'Retinol' },
  { id: '3', name: 'Hyaluronic Acid' }
]

const SearchComponent: React.FC = () => {
  return (
    <div className="z-0 flex w-full flex-col justify-center bg-white px-20 py-8 max-md:max-w-full max-md:px-5">
      <div className="flex w-full flex-col px-6 max-md:max-w-full max-md:px-5">
        <SearchBar placeholder="Search for products, ingredients, or concerns..." />
        <PopularTags tags={popularTags} />
      </div>
    </div>
  )
}

export default SearchComponent
