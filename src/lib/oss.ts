import { BucketAccess } from '@/types/bucket'
import OSS from 'ali-oss/dist/aliyun-oss-sdk.js'

async function fetchSTS(bucketAccess: BucketAccess = 'public') {
  try {
    const response = await fetch(`/api/oss/sts?bucketAccess=${bucketAccess}`, {
      method: 'GET',
      cache: 'no-store'
    })

    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload.error)
    }
    return payload
  } catch (error) {
    console.error('fetchSTS Error:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch STS token'
    )
  }
}

export async function uploadAvatar(userId: string, file: File) {
  const {
    accessKeyId,
    accessKeySecret,
    securityToken,
    bucketData: { bucket, region }
  } = await fetchSTS()
  debugger
  try {
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
      headers: {
        'Content-Type': file.type
      }
    })

    return result
  } catch (error) {
    console.error('OSS Upload Error:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to upload file'
    )
  }
}

export async function uploadDocuments(userId: string, files: File[]) {
  const {
    accessKeyId,
    accessKeySecret,
    securityToken,
    bucketData: { bucket, region }
  } = await fetchSTS('private')

  try {
    const client = new OSS({
      region,
      bucket,
      accessKeyId,
      accessKeySecret,
      stsToken: securityToken
    })

    const timestamp = Date.now()
    const tasks = files.map(file => {
      const key = `documents/${userId}/${file.name}_${timestamp}`
      return client.put(key, file, {
        headers: {
          'Content-Type': file.type
        }
      })
    })

    const Results = await Promise.all(tasks)
    return Results
  } catch (error) {
    console.error('OSS Upload Error:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to upload files'
    )
  }
}
