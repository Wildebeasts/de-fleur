import { QuestionResponse } from './Question'

export interface QuizResponse {
  id: string
  title: string
  description: string
  targetAgeFrom: number
  targetAgeTo: number
  questions?: QuestionResponse[]
}
