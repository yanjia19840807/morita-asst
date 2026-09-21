import 'server-only'
import { createReadStream } from 'node:fs'
import { mkdir, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { NotFoundError } from '@/lib/api/errors'
import {
  createStorageKey,
  resolveStoragePath,
  type StorageKind
} from './paths'

export {
  createStorageKey,
  getStoredFileUrl,
  resolveStoragePath
} from './paths'

export async function saveStoredFile(
  kind: StorageKind,
  userId: string,
  file: File
) {
  return saveStoredBuffer(
    kind,
    userId,
    file.name,
    Buffer.from(await file.arrayBuffer())
  )
}

export async function saveStoredBuffer(
  kind: StorageKind,
  userId: string,
  filename: string,
  data: Buffer
) {
  const storageKey = createStorageKey(kind, userId, filename)
  const filePath = resolveStoragePath(storageKey)

  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, data)

  return storageKey
}

export async function getStoredFileStat(storageKey: string) {
  const filePath = resolveStoragePath(storageKey)

  try {
    return {
      filePath,
      stat: await stat(filePath)
    }
  } catch {
    throw new NotFoundError('文件')
  }
}

export function createStoredFileStream(storageKey: string) {
  const filePath = resolveStoragePath(storageKey)
  return createReadStream(filePath)
}

export function resolveStoredFilePath(storageKey: string) {
  return resolveStoragePath(storageKey)
}
