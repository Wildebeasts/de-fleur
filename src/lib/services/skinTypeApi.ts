import axiosClient from '../api/axiosClient'
import { ApiResponse } from '../types/base/Api'
import { SkinTypeResponse } from '../types/SkinType'

const skinTypeApi = {
  getSkinTypes: () =>
    axiosClient.get<ApiResponse<SkinTypeResponse[]>>('/skin-type')
}

export default skinTypeApi
