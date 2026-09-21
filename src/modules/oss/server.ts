import { createStoredFileStream, resolveStoredFilePath } from '@/modules/storage/server'
import { getStoredFileStat } from '@/modules/storage/server'

export async function downloadFile(storageKey: string) {
  return resolveStoredFilePath(storageKey)
}

export async function getStoredObjectStream(storageKey: string) {
  const { stat } = await getStoredFileStat(storageKey)
  return {
    stream: createStoredFileStream(storageKey),
    size: stat.size
  }
}

export async function downloadFileAsBuffer(storageKey: string) {
  const { readFile } = await import('node:fs/promises')
  return readFile(resolveStoredFilePath(storageKey))
}
