import axiosClient from '../api/axiosClient'
import { ApiResponse } from '@/lib/types/base/Api'
import { RoutineResponse } from '@/lib/types/Routine'

const routineApi = {
  getRoutine: (id: string) =>
    axiosClient.get<ApiResponse<RoutineResponse[]>>(`/routine/skin-type/${id}`)
}

export default routineApi
