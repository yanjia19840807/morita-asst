export type ApiErrorPayload = {
  message: string
  code?: string
}

export type ResponseResult<T = never> =
  | ([T] extends [never] ? { success: true } : { success: true; data: T })
  | {
      success: false
      error: ApiErrorPayload
    }

export function getErrorMessage(error: unknown): string {
  let message: string
  if (error instanceof Error) {
    message = error.message
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String(error.message)
  } else if (typeof error === 'string') {
    message = error
  } else {
    message = '发生了错误'
  }

  return message
}
