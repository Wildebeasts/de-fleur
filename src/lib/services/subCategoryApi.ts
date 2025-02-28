import axiosClient from '../context/axiosClient'
import { ApiResponse } from '../types/base/Api'
import { SubCategoryResponse } from '../types/SubCategory'

const subCategoryApi = {
  getSubCategories: () =>
    axiosClient.get<ApiResponse<SubCategoryResponse[]>>('/sub-category')
}

export default subCategoryApi
