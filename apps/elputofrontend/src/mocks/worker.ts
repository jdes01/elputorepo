import { setupWorker } from 'msw/browser'

import { eventHandlers } from './handlers/event'

export const worker = setupWorker(...eventHandlers)
