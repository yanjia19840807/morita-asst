import 'server-only'

import OSS from 'ali-oss'
import { getSTS } from '@/dal/sts-token'
import type { BucketAccess, BucketConfig } from '@/types/oss'

export function resolveBucketConfig(bucketAccess: BucketAccess): BucketConfig {
  const region = process.env.ALI_OSS_REGION
  const bucket =
    bucketAccess === 'private'
      ? process.env.ALI_PRIVATE_BUCKET
      : process.env.ALI_PUBLIC_BUCKET

  if (!region || !bucket) {
    throw new Error('OSS Missing required bucket environment variables.')
  }

  return {
    bucket,
    region
  }
}

export async function createServerClient(
  userId: string,
  bucketAccess: BucketAccess = 'private'
): Promise<OSS> {
  const { accessKeyId, accessKeySecret, securityToken } = await getSTS(userId)
  const { bucket, region } = resolveBucketConfig(bucketAccess)

  return new OSS({
    region,
    bucket,
    accessKeyId,
    accessKeySecret,
    stsToken: securityToken
  })
}

export async function downloadFileAsBuffer(
  userId: string,
  storageKey: string,
  bucketAccess: BucketAccess = 'private'
): Promise<Buffer> {
  const client = await createServerClient(userId, bucketAccess)
  const result = await client.get(storageKey)
  const content = result.content

  if (Buffer.isBuffer(content)) {
    return content
  }

  if (content instanceof Uint8Array) {
    return Buffer.from(content)
  }

  if (typeof content === 'string') {
    return Buffer.from(content)
  }

  if (content instanceof ArrayBuffer) {
    return Buffer.from(content)
  }

  throw new Error('无法将 OSS 文件内容转换为 Buffer')
}
