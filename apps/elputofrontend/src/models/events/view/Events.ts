import { GetEventsResponse } from '../response/GetEvents'

export type EventsView = {
  description: string
  id: string
  imageUrl: string
  title: string
}[]

export const EventsView = {
  fromResponse: (response: GetEventsResponse): EventsView => {
    return response.map((event) => ({
      description: event.description,
      id: event.id,
      imageUrl: event.imageUrl,
      title: event.title,
    }))
  },
}
