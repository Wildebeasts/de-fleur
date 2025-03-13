import axiosClient from '../api/axiosClient'
import { ApiResponse } from '../types/base/Api'
import { BatchesApiResponse } from '../types/Batch'

const batchApi = {
  getBatches: () =>
    axiosClient.get<ApiResponse<BatchesApiResponse[]>>('/batch/get-all'),
  deleteBatch: (batchId: string) =>
    axiosClient.delete<ApiResponse<BatchesApiResponse>>(`/batch/${batchId}`)
}

export default batchApi
