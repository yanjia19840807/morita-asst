import STS from '@alicloud/sts-sdk'

interface Credentials {
  accessKeyId: string
  accessKeySecret: string
  securityToken: string
  expiration: string
}

const credentialCache = new Map<string, Credentials>()
const endpoint = 'sts.aliyuncs.com'
const BUFFER_SECONDS = 300

function isValid(expiresAt: number): boolean {
  return Date.now() + BUFFER_SECONDS * 1000 < expiresAt
}

async function fetchSTS(userId: string): Promise<Credentials> {
  const accessKeyId = process.env.ALI_ACCESS_KEY_ID
  const accessKeySecret = process.env.ALI_ACCESS_KEY_SECRET
  const roleArn = process.env.ALI_ROLE_ARN
  const roleSessionName = [process.env.APP_NAME, userId, Date.now()].join('_')

  if (!accessKeyId || !accessKeySecret || !roleArn) {
    throw new Error('STS Missing required environment variables.')
  }

  const sts = new STS({
    endpoint,
    accessKeyId,
    accessKeySecret
  })

  const response = await sts.assumeRole(roleArn, roleSessionName)

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

export async function getSTS(userId: string): Promise<Credentials> {
  const cached = credentialCache.get(userId)

  if (cached && isValid(new Date(cached.expiration).getTime())) {
    return cached
  } else {
    const credentials = await fetchSTS(userId)
    credentialCache.set(userId, credentials)
    return credentials
  }
}
