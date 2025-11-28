export type ApiResponse<T> = {
  message: string
  data: T
  errors: any
  metadata: any
}