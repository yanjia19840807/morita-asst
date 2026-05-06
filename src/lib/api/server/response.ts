import { NextResponse } from 'next/server'
import { APIError } from '@/lib/api/server/errors'
import {
  ApiErrorPayload,
  getErrorMessage,
  ResponseResult
} from '@/lib/api/shared/response'

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
  error: ApiErrorPayload
} {
  console.error('Action Error:', error)

  if (error instanceof APIError) {
    return {
      success: false,
      error: { message: error.message, code: error.code }
    }
  }

  return {
    success: false,
    error: { message: getErrorMessage(error), code: 'INTERNAL_ERROR' }
  }
}
