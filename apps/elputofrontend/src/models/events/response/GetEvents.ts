import { ApiResponse } from '../../common/ApiResponse'

export type GetEventsResponse = ApiResponse<{
  events: {
    id: string
    name: string
    capacity: number
  }[]
}>