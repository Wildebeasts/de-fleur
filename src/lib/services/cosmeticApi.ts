import { ApiResponse } from '@/lib/types/base/Api'
import { CosmeticResponse } from '@/lib/types/Cosmetic'
import axiosClient from '../context/axiosClient'

const cosmeticApi = {
  getCosmetics: () =>
    axiosClient.get<ApiResponse<CosmeticResponse[]>>('/cosmetic/get-all')
}

export default cosmeticApi
