import { RoutineStepResponse } from './RoutineStep'
import { SkinTypeResponse } from './SkinType'

export interface RoutineResponse {
  id: string
  title: string
  period: string
  skinType: SkinTypeResponse
  routineSteps: RoutineStepResponse[]
}
