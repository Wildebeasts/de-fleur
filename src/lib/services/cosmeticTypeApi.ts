import axiosClient from '../context/axiosClient'
import { ApiResponse } from '../types/base/Api'
import { CosmeticTypeResponse } from '../types/CosmeticType'

const cosmeticTypeApi = {
  getCosmeticTypes: () =>
    axiosClient.get<ApiResponse<CosmeticTypeResponse[]>>('/cosmetic-type'),
  deleteCosmeticType: (cosmeticTypeId: string) =>
    axiosClient.delete<ApiResponse<CosmeticTypeResponse>>(
      `/cosmetic-type/${cosmeticTypeId}`
    )
}

export default cosmeticTypeApi
