import axiosClient from '../api/axiosClient'
import { ApiResponse } from '../types/base/Api'
import { BlogData, BlogCreateDto } from '../types/Blog'

const blogApi = {
  getBlogs: (page = 1, pageSize = 10, searchText = '') =>
    axiosClient.get<ApiResponse<BlogData>>(
      `/blogs?pageIndex=${page}&pageSize=${pageSize}&search=${searchText}`
    ),
  createBlog: (data: BlogCreateDto) =>
    axiosClient.post<ApiResponse<BlogData>>(`/blogs`, data),
  deleteBlog: (blogId: string) =>
    axiosClient.delete<ApiResponse<BlogData>>(`/blogs/${blogId}`)
}

export default blogApi
