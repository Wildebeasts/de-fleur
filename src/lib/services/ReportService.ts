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
  },

  createReport: async (reportData: {
    fromDate: string
    toDate: string
    format?: string
    type?: string
  }) => {
    const params = new URLSearchParams()

    if (reportData.fromDate) params.append('fromDate', reportData.fromDate)
    if (reportData.toDate) params.append('toDate', reportData.toDate)
    if (reportData.format) params.append('format', reportData.format)
    if (reportData.type) params.append('type', reportData.type)

    const response = await axiosClient.get<Blob>(
      `/reports?${params.toString()}`,
      {
        responseType: 'blob',
        headers: {
          Accept: '*/*'
        }
      }
    )

    const fileExtension = reportData.format?.toLowerCase() || 'pdf'

    const fileName = `report_${reportData.fromDate.substring(0, 10)}_to_${reportData.toDate.substring(
      0,
      10
    )}.${fileExtension}`

    const blob = new Blob([response.data], {
      type:
        fileExtension === 'pdf'
          ? 'application/pdf'
          : fileExtension === 'csv'
            ? 'text/csv'
            : 'application/octet-stream'
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()

    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)

    return { isSuccess: true }
  }
}

export default reportApi
