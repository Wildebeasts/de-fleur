import axiosClient from '../api/axiosClient'
import { ApiResponse } from '../types/base/Api'
import { FeedbackRequest, FeedbackResponse } from '../types/Feedback'

const feedbackApi = {
  submitFeedback: async (request: FeedbackRequest) => {
    return axiosClient.post<ApiResponse<FeedbackResponse>>(
      `/feedback`,
      request,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )
  }
}

export default feedbackApi
