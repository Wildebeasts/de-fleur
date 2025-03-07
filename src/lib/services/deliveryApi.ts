import axiosClient from '../api/axiosClient'
import { ApiResponse } from '@/lib/types/base/Api'
import {
  CalculateShippingFeeRequest,
  DistrictData,
  FeeData,
  GetDistrictRequest,
  GetWardRequest,
  ProvinceData,
  WardData
} from '../types/delivery'

const ghnApi = {
  // Get Province API
  getProvince: () =>
    axiosClient.get<ApiResponse<ProvinceData[]>>('/ghn/get-province'),

  // Get District API
  getDistrict: (request: GetDistrictRequest) =>
    axiosClient.post<ApiResponse<DistrictData[]>>('/ghn/get-district', request),

  // Get Ward API
  getWard: (request: GetWardRequest) =>
    axiosClient.post<ApiResponse<WardData[]>>('/ghn/get-ward', request),

  // Calculate Shipping Fee API
  calculateFee: (request: CalculateShippingFeeRequest) =>
    axiosClient.post<ApiResponse<FeeData>>('/ghn/calculate-fee', request)
}

export default ghnApi
