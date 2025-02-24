import axiosClient from '@/apis/axiosClient'
import { ApiResponse } from '@/types/base/Api'
import { QuizResponse } from '@/types/Quiz'
import { RoutineResponse } from '@/types/Routine'

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
