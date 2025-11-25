import { useQuery } from '@tanstack/react-query'

import { GetEventsResponse } from '../../models/events/response/GetEvents'
import { EventsView } from '../../models/events/view/Events'
import { useFetch } from '../../services/http/fetcher'
import { eventsQueryKeys } from './queryKeys'

export const useGetEvents = () => {
  const fetch = useFetch()

  return useQuery({
    queryFn: async () => {
      const response = await fetch<GetEventsResponse>(
        `${import.meta.env.VITE_API_URL}/events`,
      )
      return EventsView.fromResponse(response)
    },
    queryKey: eventsQueryKeys.all,
  })
}
