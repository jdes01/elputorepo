import { GetEventsResponse } from '../response/GetEvents'

export type EventsView = {
  capacity: number
  description: string
  id: string
  imageUrl: string
  title: string
}[]

export const EventsView = {
  fromResponse: (response: GetEventsResponse): EventsView => {
    return response.map((event) => ({
      capacity: event.capacity,
      description: `Esta es la description del evento ${event.id} - ${event.name}`,
      id: event.id,
      imageUrl: 'https://picsum.photos/id/200/250',
      title: event.name,
    }))
  },
}
