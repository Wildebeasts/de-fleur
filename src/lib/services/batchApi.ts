import axiosClient from '../api/axiosClient'
import { ApiResponse } from '../types/base/Api'
import { BatchesApiResponse } from '../types/Batch'

const batchApi = {
  getBatches: () =>
    axiosClient.get<ApiResponse<BatchesApiResponse[]>>('/batch/get-all'),
  deleteBatch: (batchId: string) =>
    axiosClient.delete<ApiResponse<BatchesApiResponse>>(`/batch/${batchId}`),
  createBatch: (batchData: {
    cosmeticId: string
    quantity: number
    manufactureDate: string
    expirationDate: string
  }) =>
    axiosClient.post<ApiResponse<BatchesApiResponse>>(
      '/batch/create',
      batchData
    ),
  updateBatch: (
    batchId: string,
    batchData: {
      quantity: number
      exportedDate: string
    }
  ) =>
    axiosClient.put<ApiResponse<BatchesApiResponse>>(
      `/batch/${batchId}`,
      batchData
    ),
  getBatchById: (batchId: string) =>
    axiosClient.get<ApiResponse<BatchesApiResponse>>(`/batch/${batchId}`)
}

export default batchApi
