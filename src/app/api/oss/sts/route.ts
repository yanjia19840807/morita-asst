import { NextRequest } from 'next/server'
import { withAuth } from '@/modules/auth/api'
import { getStsTokenResponse } from '@/modules/sts/service'
import { handleApiError, handleApiResult } from '@/lib/api/response'
import { APIError } from '@/lib/api/errors'

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const response = await getStsTokenResponse({
      bucketAccess: searchParams.get('bucketAccess')
    })

    return handleApiResult(response)
  } catch (error) {
    console.error('STS AssumeRole Error:', error)

    return handleApiError(new APIError('获取STS令牌失败'))
  }
})
