import axiosClient from '../context/axiosClient'
import { CategoryResponse } from '@/lib/types/Category'
import { ApiResponse } from '../types/base/Api'

const categoryApi = {
  getCategories: () =>
    axiosClient.get<ApiResponse<CategoryResponse[]>>('/category')
}

export default categoryApi
