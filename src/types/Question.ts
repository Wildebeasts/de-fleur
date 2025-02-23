import { QuestionOptionResponse } from './QuestionOption'

export interface QuestionResponse {
  id: string
  title?: string
  description?: string
  instruction?: string
  section?: string
  questionType?: string
  questionOptions?: QuestionOptionResponse[]
}
