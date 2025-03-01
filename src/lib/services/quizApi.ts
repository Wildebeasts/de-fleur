import axiosClient from '../api/axiosClient'
import { ApiResponse } from '@/lib/types/base/Api'
import { QuizResponse } from '@/lib/types/Quiz'
import { RoutineResponse } from '@/lib/types/Routine'

const quizApi = {
  getQuiz: () => axiosClient.get<ApiResponse<QuizResponse>>('/quiz'),
  submitQuiz: (
    id: string,
    data: {
      answers: { questionId: string; selectedOptionIds: string[] }[]
    }
  ) =>
    axiosClient.post<ApiResponse<RoutineResponse[]>>(`/quiz/${id}/submit`, data)
}

export default quizApi
