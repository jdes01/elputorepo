import { useMutation, useQueryClient } from '@tanstack/react-query'
import { v4 as uuidv4 } from 'uuid'

import { useFetch } from '../../services/http/fetcher'
import { eventsQueryKeys } from './queryKeys'

type CreateEventProps = {
  capacity: number
  title: string
}

export const useCreateEvent = () => {
  const queryClient = useQueryClient()
  const fetch = useFetch()
  const eventId = uuidv4()

  return useMutation({
    mutationFn: async (event: CreateEventProps) => {
      await fetch(`/events/${eventId}`, {
        body: JSON.stringify({
          capacity: event.capacity,
          name: event.title,
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
