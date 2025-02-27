import axiosClient from '../context/axiosClient'
import { ApiResponse } from '../types/base/Api'
import { BlogData } from '../types/Blog'

const blogApi = {
  getBlogs: (pageSize: number) =>
    axiosClient.get<ApiResponse<BlogData>>(`/blogs?pageSize=${pageSize}`)
}

export default blogApi
