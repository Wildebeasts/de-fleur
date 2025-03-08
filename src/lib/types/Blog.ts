import { TagResponse } from './Tag'

export interface BlogResponse {
  id: string
  staffName: string
  title: string
  shortenContent: string
  content: string
  tags: TagResponse[]
}

export interface BlogData {
  items: BlogResponse[]
  pageIndex: number
  totalPages: number
  pageSize: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface BlogCreateDto {
  title: string
  content: string
}
