import { useMutation, useQueryClient } from '@tanstack/react-query'
import { v4 as uuidv4 } from 'uuid'

import { useFetch } from '../../services/http/fetcher'
import { eventsQueryKeys } from './queryKeys'

type CreateEventProps = {
  capacity: number
  title: string
  imageUrl: string
}

export const useCreateEvent = () => {
  const queryClient = useQueryClient()
  const fetch = useFetch()
  const eventId = uuidv4()

  return useMutation({
    mutationFn: async (event: CreateEventProps) => {
      await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}`, {
        body: JSON.stringify({
          capacity: event.capacity,
          name: event.title,
          imageUrl: event.imageUrl,
        }),
        method: 'POST',
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: eventsQueryKeys.all,
      })
    },
  })
}
