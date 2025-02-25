import {
  useQuery,
  useMutation,
  UseQueryResult,
  UseMutationResult
} from '@tanstack/react-query'
import quizApi from '../services/quizApi'
import { QuizResponse } from '../types/Quiz'
import { RoutineResponse } from '../types/Routine'

export function useGetQuiz(): UseQueryResult<QuizResponse, Error> {
  return useQuery({
    queryKey: ['quiz'],
    queryFn: async () => {
      const response = await quizApi.getQuiz()
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Failed to fetch quiz')
      }
      return response.data.data!
    }
  })
}

export function useSubmitQuiz(): UseMutationResult<
  RoutineResponse[],
  Error,
  {
    id: string
    data: { answers: { questionId: string; selectedOptionIds: string[] }[] }
  }
> {
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await quizApi.submitQuiz(id, data)
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Failed to submit quiz')
      }
      return response.data.data!
    }
  })
}
