import axiosClient from '@/lib/api/axiosClient'
import { ApiResponse } from '@/lib/types/base/Api'
import { BlogData } from '@/lib/types/Blog'

const blogApi = {
  getBlogs: () => axiosClient.get<ApiResponse<BlogData>>(`/blogs`)
}

export default blogApi
