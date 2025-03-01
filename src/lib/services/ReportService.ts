import axiosClient from '@/lib/api/axiosClient'
import { ApiResponse } from '@/lib/types/base/Api'

export enum ReportStatus {
  Draft = 0,
  Submitted = 1,
  InReview = 2,
  Approved = 3,
  Rejected = 4
}

export interface ReportDto {
  reportId: string
  issue: string
  content: string
  createdBy: string
  createdDate: string
  reportStatus: ReportStatus
  attachment?: string
}

interface ReportData {
  items: ReportDto[]
  totalPages: number
  totalCount: number
}

const reportApi = {
  getReports: async (page: number, pageSize: number): Promise<ReportData> => {
    const response = await axiosClient.get<ApiResponse<ReportData>>(
      `/report?page=${page}&pageSize=${pageSize}`
    )
    if (!response.data.isSuccess || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch reports')
    }
    return response.data.data
  },

  setDraft: async (reportId: string) => {
    const response = await axiosClient.put<ApiResponse<void>>(
      `/report/${reportId}/draft`
    )
    return response.data
  },

  setSubmitted: async (reportId: string) => {
    const response = await axiosClient.put<ApiResponse<void>>(
      `/report/${reportId}/submit`
    )
    return response.data
  },

  setInReview: async (reportId: string) => {
    const response = await axiosClient.put<ApiResponse<void>>(
      `/report/${reportId}/review`
    )
    return response.data
  },

  setApproved: async (reportId: string) => {
    const response = await axiosClient.put<ApiResponse<void>>(
      `/report/${reportId}/approve`
    )
    return response.data
  },

  setRejected: async (reportId: string) => {
    const response = await axiosClient.put<ApiResponse<void>>(
      `/report/${reportId}/reject`
    )
    return response.data
  },

  deleteReport: async (reportId: string) => {
    const response = await axiosClient.delete<ApiResponse<void>>(
      `/report/${reportId}`
    )
    return response.data
  }
}

export default reportApi
