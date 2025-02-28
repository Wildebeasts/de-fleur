import axiosClient from '../context/axiosClient'
import { ApiResponse } from '../types/base/Api'
import { CosmeticTypeResponse } from '../types/CosmeticType'

const cosmeticTypeApi = {
  getCosmeticTypes: () =>
    axiosClient.get<ApiResponse<CosmeticTypeResponse[]>>('/cosmetic-type')
}

export default cosmeticTypeApi
