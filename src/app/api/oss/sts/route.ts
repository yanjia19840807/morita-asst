import { getSTS } from '@/data-access/sts-token'
import { withAuth } from '@/lib/api/with-auth'
import { APIError } from '@/lib/api/errors'
import { NextRequest } from 'next/server'
import { BucketAccess } from '@/lib/oss'
import { handleApiError, handleApiResult } from '@/lib/api/response'

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const region = process.env.ALI_OSS_REGION
    const searchParams = request.nextUrl.searchParams
    const bucketAccess = searchParams.get('bucketAccess') as BucketAccess
    const bucket =
      bucketAccess === 'private'
        ? process.env.ALI_PRIVATE_BUCKET
        : process.env.ALI_PUBLIC_BUCKET

    const response = await getSTS(user.id)
    const { accessKeyId, accessKeySecret, securityToken, expiration } = response

    return handleApiResult({
      accessKeyId,
      accessKeySecret,
      securityToken,
      expiration,
      bucketData: {
        bucket,
        region
      }
    })
  } catch (error) {
    console.error('STS AssumeRole Error:', error)

    return handleApiError(new APIError('获取STS令牌失败'))
  }
})
