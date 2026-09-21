import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { ValidationError } from '@/lib/api/errors'

export const STORAGE_KINDS = ['documents', 'avatars'] as const

export type StorageKind = (typeof STORAGE_KINDS)[number]

export function getStorageRoot() {
  return path.resolve(process.cwd(), process.env.STORAGE_DIR || 'storage')
}

export function sanitizeFilename(filename: string) {
  const base = filename.split(/[/\\]/).pop() || 'file'
  return base.replace(/[^\w.\u4e00-\u9fa5-]+/g, '_').slice(0, 120) || 'file'
}

export function createStorageKey(
  kind: StorageKind,
  userId: string,
  filename: string
) {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '') || 'unknown'
  return `${kind}/${safeUserId}/${randomUUID()}_${sanitizeFilename(filename)}`
}

export function resolveStoragePath(storageKey: string) {
  const normalized = storageKey.replace(/\\/g, '/').replace(/^\/+/, '')

  if (
    !normalized ||
    normalized.includes('..') ||
    !/^(documents|avatars)\/[^/]+\/[^/]+$/.test(normalized)
  ) {
    throw new ValidationError('非法存储路径')
  }

  const root = getStorageRoot()
  const absolute = path.resolve(root, normalized)
  const rootWithSep = root.endsWith(path.sep) ? root : `${root}${path.sep}`

  if (absolute !== root && !absolute.startsWith(rootWithSep)) {
    throw new ValidationError('非法存储路径')
  }

  return absolute
}

export { getStoredFileUrl } from './urls'
