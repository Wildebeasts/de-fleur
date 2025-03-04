import axiosClient from '../context/axiosClient'
import { ApiResponse } from '../types/base/Api'
import { BrandResponse } from '../types/Brand'

const brandApi = {
  getBrands: () => axiosClient.get<ApiResponse<BrandResponse[]>>('/brand'),
  deleteBrand: (brandId: string) =>
    axiosClient.delete<ApiResponse<BrandResponse>>(`/brand/${brandId}`)
}

export default brandApi
