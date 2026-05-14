import STS from '@alicloud/sts-sdk'
import { toStsTokenResponseDto } from './mapper'
import type {
  BucketAccess,
  BucketConfigDto,
  StsCredentialsDto,
  StsTokenResponseDto
} from './dto'
import { bucketAccessSchema } from './schemas'
import { ValidationError } from '@/lib/api/errors'
import { serverEnv } from '@/lib/env/server'
import { formatZodError } from '../../lib/zod'

let credentialCache: StsCredentialsDto | null = null
const endpoint = 'sts.aliyuncs.com'
const bufferSeconds = 300

function isValid(expiresAt: number): boolean {
  return Date.now() + bufferSeconds * 1000 < expiresAt
}

function parseBucketAccess(bucketAccess?: string | null): BucketAccess {
  const validation = bucketAccessSchema.safeParse(bucketAccess ?? 'public')
  if (!validation.success) {
    throw new ValidationError(formatZodError(validation.error))
  }

  return validation.data
}

async function fetchStsCredentials(): Promise<StsCredentialsDto> {
  const roleSessionName = [serverEnv.appName, Date.now()].join('_')

  const sts = new STS({
    endpoint,
    accessKeyId: serverEnv.aliAccessKeyId,
    accessKeySecret: serverEnv.aliAccessKeySecret
  })

  const response = await sts.assumeRole(serverEnv.aliRoleArn, roleSessionName)

  if (!response?.Credentials) {
    console.error('Failed to get STS token.', response)
    throw new Error(response?.Message || 'Failed to get STS token.')
  }

  const { AccessKeyId, AccessKeySecret, SecurityToken, Expiration } =
    response.Credentials

  return {
    accessKeyId: AccessKeyId,
    accessKeySecret: AccessKeySecret,
    securityToken: SecurityToken,
    expiration: Expiration
  }
}

export function resolveBucketConfig(
  bucketAccess: BucketAccess
): BucketConfigDto {
  const bucket =
    bucketAccess === 'private'
      ? serverEnv.aliPrivateBucket
      : serverEnv.aliPublicBucket

  return {
    region: serverEnv.aliOssRegion,
    bucket
  }
}

export async function getStsCredentials(): Promise<StsCredentialsDto> {
  const cached = credentialCache

  if (cached && isValid(new Date(cached.expiration).getTime())) {
    return cached
  }

  const credentials = await fetchStsCredentials()
  credentialCache = credentials
  return credentials
}

export async function getStsTokenResponse(input: {
  bucketAccess?: string | null
}): Promise<StsTokenResponseDto> {
  const bucketAccess = parseBucketAccess(input.bucketAccess)
  const [credentials, bucketData] = await Promise.all([
    getStsCredentials(),
    Promise.resolve(resolveBucketConfig(bucketAccess))
  ])

  return toStsTokenResponseDto(credentials, bucketData)
}
