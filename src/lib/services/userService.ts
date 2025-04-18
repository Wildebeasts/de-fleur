import axiosClient from '@/lib/api/axiosClient'
import { ApiResponse } from '@/lib/types/base/Api'
import { CreateWalkInUserRequest, UserProfile } from '../types/user'
import { UserCouponResponse } from '../types/Coupon'

export interface UserDto {
  id: string
  userName: string
  email: string
  firstName: string
  lastName: string
  avatarUrl: string
  phoneNumber: string
  emailConfirmed: boolean
  createdDate: string
  roles: string[]
}

const userApi = {
  getUserProfile: async (): Promise<UserProfile> => {
    const response = await axiosClient.get<ApiResponse<UserProfile>>('/user/me')
    if (!response.data.isSuccess || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch user profile')
    }
    return response.data.data
  },

  getUserRoles: async (): Promise<string[]> => {
    try {
      const userProfile = await userApi.getUserProfile()
      return userProfile.roles || []
    } catch (error) {
      console.error('Error getting user roles:', error)
      throw new Error('Failed to get user roles')
    }
  },

  getUsers: async (page?: number, pageSize?: number) => {
    try {
      // Build the URL with optional pagination parameters
      let url = '/user'
      if (page !== undefined && pageSize !== undefined) {
        url += `?page=${page}&pageSize=${pageSize}`
      }

      const response = await axiosClient.get(url)

      // Log the full response to debug
      console.log('Get users API response:', response.data)

      // Handle the case where response.data is directly an array
      if (Array.isArray(response.data)) {
        return {
          isSuccess: true,
          data: response.data as UserDto[],
          message: 'Successfully retrieved users',
          errors: []
        }
      }

      // Handle the case with isSuccess property
      if (response.data && response.data.isSuccess === true) {
        return response.data
      }

      throw new Error(
        (response.data && response.data.message) || 'Failed to fetch users'
      )
    } catch (error) {
      console.error('Error in getUsers:', error)
      throw error
    }
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
  },

  createWalkInUser: async (user: CreateWalkInUserRequest): Promise<UserDto> => {
    const response = await axiosClient.post<ApiResponse<UserDto>>(
      '/user/walkin',
      user
    )
    if (!response.data.isSuccess || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create user')
    }
    return response.data.data
  },

  getUserCoupons: async (): Promise<UserCouponResponse[]> => {
    const response =
      await axiosClient.get<ApiResponse<UserCouponResponse[]>>('/user/coupons')
    if (!response.data.isSuccess || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch user coupons')
    }
    return response.data.data
  }
}

export default userApi
