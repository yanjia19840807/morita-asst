import { getSTS } from '@/data-access/sts-token'
import { withAuth } from '@/lib/api/server/with-auth'
import { APIError } from '@/lib/api/server/errors'
import { NextRequest } from 'next/server'
import { resolveBucketConfig } from '@/services/oss-server'
import type { BucketAccess } from '@/types/oss'
import { handleApiError, handleApiResult } from '@/lib/api/server/response'

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const bucketAccess = searchParams.get('bucketAccess') as BucketAccess
    const bucketData = resolveBucketConfig(bucketAccess)

    const response = await getSTS(user.id)
    const { accessKeyId, accessKeySecret, securityToken, expiration } = response

    return handleApiResult({
      accessKeyId,
      accessKeySecret,
      securityToken,
      expiration,
      bucketData
    })
  } catch (error) {
    console.error('STS AssumeRole Error:', error)

    return handleApiError(new APIError('获取STS令牌失败'))
  }
})
