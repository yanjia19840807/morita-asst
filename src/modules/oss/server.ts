import 'server-only'

import OSS from 'ali-oss'
import {
  getStsCredentials,
  resolveBucketConfig,
  type BucketAccess
} from '@/modules/sts'
import path from 'path'
import os from 'os'
import fs from 'fs'
import { serverEnv } from '@/lib/env/server'

export async function createServerOssClient(
  bucketAccess: BucketAccess = 'private'
): Promise<OSS> {
  const { accessKeyId, accessKeySecret, securityToken } =
    await getStsCredentials()
  const { bucket, region } = resolveBucketConfig(bucketAccess)

  return new OSS({
    region,
    bucket,
    accessKeyId,
    accessKeySecret,
    stsToken: securityToken
  })
}

export async function downloadFile(storageKey: string) {
  const client = await createServerOssClient()
  const sysTempDir = os.tmpdir()
  const tempDir = fs.mkdtempSync(path.join(sysTempDir, serverEnv.appName))
  const filePath = path.join(tempDir, storageKey)

  fs.mkdirSync(path.dirname(filePath), { recursive: true })

  await client.get(storageKey, filePath)
  return filePath
}

export async function downloadFileAsBuffer(
  storageKey: string,
  bucketAccess: BucketAccess = 'private'
): Promise<Buffer> {
  const client = await createServerOssClient(bucketAccess)
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
