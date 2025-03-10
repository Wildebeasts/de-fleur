import axiosClient from '../api/axiosClient'
import { ApiResponse } from '../types/base/Api'
import { EventCreateRequest, EventResponse } from '../types/Event'

const eventApi = {
  getAllEvents: () => axiosClient.get<ApiResponse<EventResponse[]>>('/events'),
  createEvent: (request: EventCreateRequest) =>
    axiosClient.post<ApiResponse<EventResponse>>('/events', request),
  applyEvent: (eventName: string) =>
    axiosClient.patch<ApiResponse<EventResponse>>(`/events/apply/${eventName}`)
}

export default eventApi
