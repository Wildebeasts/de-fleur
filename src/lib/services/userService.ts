import axiosClient from '@/lib/api/axiosClient'
import { ApiResponse } from '@/lib/types/base/Api'

export interface UserDto {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  avatarUrl: string
  emailConfirmed: boolean
  createdDate: string
  roles: string[]
}

export interface UserProfile {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  avatarUrl: string
  roles: string[]
}

const userApi = {
  getUserProfile: async (): Promise<UserProfile> => {
    const response =
      await axiosClient.get<ApiResponse<UserProfile>>('/user/profile')
    if (!response.data.isSuccess || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch user profile')
    }
    return response.data.data
  },

  getUserRoles: async (): Promise<string[]> => {
    const response = await axiosClient.get<ApiResponse<string[]>>('/user/roles')
    if (!response.data.isSuccess || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch user roles')
    }
    return response.data.data
  },

  getUsers: async (page: number, pageSize: number) => {
    const response = await axiosClient.get<
      ApiResponse<{
        items: UserDto[]
        totalPages: number
        totalCount: number
      }>
    >(`/user?page=${page}&pageSize=${pageSize}`)
    if (!response.data.isSuccess || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch users')
    }
    return response.data.data
  },

  getUserById: async (id: string): Promise<UserDto> => {
    const response = await axiosClient.get<ApiResponse<UserDto>>(`/user/${id}`)
    if (!response.data.isSuccess || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch user')
    }
    return response.data.data
  },

  updateUserAvatar: async (formData: FormData): Promise<void> => {
    const response = await axiosClient.post<ApiResponse<void>>(
      '/user/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    if (!response.data.isSuccess || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update avatar')
    }
  },

  updateUser: async (userData: Partial<UserDto>): Promise<void> => {
    const response = await axiosClient.put<ApiResponse<void>>('/user', userData)
    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Failed to update user')
    }
  }
}

export default userApi
