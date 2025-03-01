import axiosClient from '../api/axiosClient'
import { ApiResponse } from '../types/base/Api'
import { BlogData } from '../types/Blog'

const blogApi = {
  getBlogs: () => axiosClient.get<ApiResponse<BlogData>>(`/blogs`)
}

export default blogApi
