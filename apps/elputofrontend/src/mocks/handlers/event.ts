import { http, HttpResponse } from 'msw'

import { getEventsResponse } from '../responses/event'

const getEventsPath = `**/events`
const getEventsHandler = http.get(getEventsPath, () =>
  HttpResponse.json(getEventsResponse),
)

const createEventPath = `**/events`
const createEventHandler = http.post(createEventPath, () =>
  HttpResponse.json({}),
)

export const eventHandlers = [getEventsHandler, createEventHandler]
