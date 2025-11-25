import { http, HttpResponse } from 'msw'

import { getEventsResponse } from '../responses/event'

const getEventsPath = `**/events`
const getEventsHandler = http.get(getEventsPath, () =>
  HttpResponse.json(getEventsResponse),
)

export const eventHandlers = [getEventsHandler]
