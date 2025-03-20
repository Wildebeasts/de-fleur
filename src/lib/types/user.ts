import { SkinTypeResponse } from './SkinType'

export interface CreateWalkInUserRequest {
  UserName: string
  PhoneNumber: string
}

export interface UserProfile {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  avatarUrl: string
  skinTypeId: string
  skinType: SkinTypeResponse
  roles: string[]
  point: number
}
