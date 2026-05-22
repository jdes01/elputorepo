import { ApiResponse } from '../../common/ApiResponse'



export type GetEventsResponse = ApiResponse<{
  events: Array<{
    id: string
    name: string
    capacity: number
    imageUrl: string
  }>
}>