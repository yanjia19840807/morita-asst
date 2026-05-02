import OSS from 'ali-oss/dist/aliyun-oss-sdk.js'

export type BucketAccess = 'public' | 'private'

async function fetchSTS(bucketAccess: BucketAccess = 'public') {
  const response = await fetch(`/api/oss/sts?bucketAccess=${bucketAccess}`, {
    method: 'GET',
    cache: 'no-store'
  })

  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload.error)
  }
  return payload.data
}

let documentClientCache: { client: OSS; expiresAt: number } | null = null

async function getDocumentClient(): Promise<OSS> {
  if (documentClientCache && Date.now() < documentClientCache.expiresAt) {
    return documentClientCache.client
  }
  const {
    accessKeyId,
    accessKeySecret,
    securityToken,
    bucketData: { bucket, region }
  } = await fetchSTS('private')
  const client = new OSS({
    region,
    bucket,
    accessKeyId,
    accessKeySecret,
    stsToken: securityToken
  })
  documentClientCache = { client, expiresAt: Date.now() + 55 * 60 * 1000 }
  return client
}

export async function uploadAvatar(userId: string, file: File) {
  const {
    accessKeyId,
    accessKeySecret,
    securityToken,
    bucketData: { bucket, region }
  } = await fetchSTS()

  const client = new OSS({
    region,
    bucket,
    accessKeyId,
    accessKeySecret,
    stsToken: securityToken
  })

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
  const client = await getDocumentClient()
  const key = `documents/${userId}/${file.name}_${Date.now()}`
  const result = await client.multipartUpload(key, file, {
    headers: { 'Content-Type': file.type },
    partSize: 1024 * 1024,
    parallel: 4,
    progress: (p: number) => onProgress?.(Math.floor(p * 100))
  })
  return result.name
}
