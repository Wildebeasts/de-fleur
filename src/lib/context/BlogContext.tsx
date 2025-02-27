import { createContext, useContext, useEffect, useState } from 'react'
import { BlogResponse } from '../types/Blog'
import blogApi from '../services/blogApi'

interface BlogContextType {
  blogs: BlogResponse[]
  filteredBlogs: BlogResponse[]
  topicFilter: string | null
  setTopicFilter: (tag: string | null) => void
  page: number
  setPage: (page: number) => void
  totalPages: number
}

const BlogContext = createContext<BlogContextType | undefined>(undefined)

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [blogs, setBlogs] = useState<BlogResponse[]>([])
  const [filteredBlogs, setFilteredBlogs] = useState<BlogResponse[]>([])
  const [topicFilter, setTopicFilter] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 3 // Adjust as needed

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await blogApi.getBlogs()
        if (response.data.data) {
          setBlogs(response.data.data.items)
        }
      } catch (error) {
        console.error('Error fetching blogs:', error)
      }
    }
    fetchBlogs()
  }, [])

  useEffect(() => {
    let filtered = blogs
    if (topicFilter) {
      filtered = blogs.filter((blog) =>
        blog.tags.some((tag) => tag.name === topicFilter)
      )
    }

    const totalBlogs = filtered.length // Get total number of blogs
    setTotalPages(Math.ceil(totalBlogs / pageSize)) // Calculate total pages

    setFilteredBlogs(filtered.slice((page - 1) * pageSize, page * pageSize))
  }, [blogs, topicFilter, page])

  return (
    <BlogContext.Provider
      value={{
        blogs,
        filteredBlogs,
        topicFilter,
        setTopicFilter,
        page,
        setPage,
        totalPages
      }}
    >
      {children}
    </BlogContext.Provider>
  )
}

export const useBlogContext = () => {
  const context = useContext(BlogContext)
  if (!context)
    throw new Error('useBlogContext must be used within a BlogProvider')
  return context
}
