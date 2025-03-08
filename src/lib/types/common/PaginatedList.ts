/**
 * Generic paginated list interface that matches the backend PaginatedList<T> class
 */
export interface PaginatedList<T> {
  items: T[]
  pageIndex: number
  totalPages: number
  pageSize: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
