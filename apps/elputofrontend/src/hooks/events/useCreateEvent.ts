import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useFetch } from '../../services/http/fetcher'
import { eventsQueryKeys } from './queryKeys'

type CreateEventProps = {
  description: string
  title: string
}

export const useCreateEvent = () => {
  const queryClient = useQueryClient()
  const fetch = useFetch()

  return useMutation({
    mutationFn: async (event: CreateEventProps) => {
      await fetch('/events', {
        body: JSON.stringify(event),
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
