import { useCallback } from 'react'

export const useFetch = (): (<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<T>) => {
  return useCallback(
    async <T>(input: RequestInfo | URL, init?: RequestInit) => {
      const response = await fetch(input, {
        ...init,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        let error
        try {
          error = await response.json()
        } catch {}

        throw {
          ...error,
          status: response.status,
        }
      }

      return response.json() as Promise<T>
    },
    [],
  )
}
