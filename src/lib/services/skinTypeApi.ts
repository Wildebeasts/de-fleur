import axiosClient from '../context/axiosClient'
import { ApiResponse } from '../types/base/Api'
import { SkinTypeResponse } from '../types/SkinType'

const skinTypeApi = {
  getSkinTypes: () =>
    axiosClient.get<ApiResponse<SkinTypeResponse[]>>('/skin-type'),
  deleteSkinType: (skinTypeId: string) =>
    axiosClient.delete<ApiResponse<SkinTypeResponse>>(
      `/skin-type/${skinTypeId}`
    )
}

export default skinTypeApi
