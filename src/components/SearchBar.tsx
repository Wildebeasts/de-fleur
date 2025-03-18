import * as React from 'react'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { debounce } from 'lodash'

export function SearchBar() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  // Debounced search function
  const debouncedSearch = React.useCallback(
    debounce((term: string) => {
      if (term.trim()) {
        navigate({
          to: '/shop',
          search: { name: term.trim() }
        })
      }
    }, 1000), // 1 second debounce
    [navigate]
  )

  // Handle input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    debouncedSearch(term)
  }

  // Handle form submission for immediate search
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Cancel any pending debounced searches
      debouncedSearch.cancel()

      // Navigate immediately to shop page with search term
      navigate({
        to: '/shop',
        search: { name: searchTerm.trim() }
      })
    }
  }

  return (
    <form
      className="flex gap-2 rounded-full bg-orange-50 px-4 py-2"
      role="search"
      onSubmit={handleSubmit}
    >
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/b001b80f502bb826e64c2bd030f619d3ed87a53bdbab9446c1f2b8ab59d9008d?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e"
        alt=""
        className="my-auto aspect-square w-4 shrink-0 object-contain"
      />
      <input
        type="search"
        id="search"
        className="w-64 border-none bg-transparent py-1.5 focus:outline-none"
        placeholder="Search..."
        aria-label="Search"
        value={searchTerm}
        onChange={handleSearchChange}
      />
    </form>
  )
}
