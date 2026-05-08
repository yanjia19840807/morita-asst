import type OSS from 'ali-oss'
import type { BucketAccess, STSResponse } from '@/types/oss'

type OSSClient = OSS

async function loadBrowserOSS() {
  const ossModule = await import('ali-oss/dist/aliyun-oss-sdk.js')
  return ossModule.default
}

async function fetchSTS(bucketAccess: BucketAccess = 'public') {
  const response = await fetch(`/api/oss/sts?bucketAccess=${bucketAccess}`, {
    method: 'GET',
    cache: 'no-store'
  })

  const payload = (await response.json()) as {
    error?: string
    data?: STSResponse
  }

  if (!response.ok || !payload.data) {
    throw new Error(payload.error ?? '获取 OSS 临时凭证失败')
  }

  return payload.data
}

async function createClient(bucketAccess: BucketAccess): Promise<OSSClient> {
  const OSS = await loadBrowserOSS()
  const { accessKeyId, accessKeySecret, securityToken, bucketData } =
    await fetchSTS(bucketAccess)

  return new OSS({
    region: bucketData.region,
    bucket: bucketData.bucket,
    accessKeyId,
    accessKeySecret,
    stsToken: securityToken
  })
}

export async function uploadAvatar(userId: string, file: File) {
  const client = await createClient('public')
  const timestamp = Date.now()
  const key = `avatars/${userId}/${file.name}_${timestamp}`
  const result = await client.put(key, file, {
    headers: { 'Content-Type': file.type }
  })

  return (result as { name: string }).name
}

export async function uploadDocs(
  userId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const client = await createClient('private')
  const key = `documents/${userId}/${file.name}_${Date.now()}`
  const result = await client.multipartUpload(key, file, {
    headers: { 'Content-Type': file.type },
    partSize: 1024 * 1024,
    parallel: 4,
    progress: (progress: number) => onProgress?.(Math.floor(progress * 100))
  })

  return result.name
}
