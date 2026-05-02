import { NextResponse } from 'next/server'
import { APIError } from './errors'

export type ResponseResult<T = never> =
  | ([T] extends [never] ? { success: true } : { success: true; data: T })
  | {
      success: false
      error: APIError
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

export function handleApiResult<T>(data?: T): NextResponse<ResponseResult<T>> {
  if (data === undefined) {
    return NextResponse.json({ success: true }) as NextResponse<
      ResponseResult<T>
    >
  }
  return NextResponse.json({ success: true, data }) as NextResponse<
    ResponseResult<T>
  >
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}

export function handleActionResult<T>(data?: T): ResponseResult<T> {
  if (data === undefined) {
    return { success: true } as ResponseResult<T>
  }
  return { success: true, data } as ResponseResult<T>
}

export function handleActionError(error: unknown): {
  success: false
  error: APIError
} {
  console.error('Action Error:', error)

  if (error instanceof APIError) {
    return { success: false, error }
  }

  return { success: false, error: new APIError(getErrorMessage(error)) }
}
