import type { DocCate } from '@/generated/prisma/client'
import type { FetchDocsResult } from '@/dal/docs'

export type SelectDocCateItem = {
  id: string
  name: string
}

export type SelectDocItem = {
  id: string
  filename: string
  fileSize: number | null
  mimeType: string | null
  createdAt: string
}

export type FetchSelectDocsResult = {
  docs: SelectDocItem[]
  total: number
}

export function toSelectDocCateItem(docCate: DocCate): SelectDocCateItem {
  return {
    id: docCate.id,
    name: docCate.name
  }
}

export function toSelectDocCateItems(docCates: DocCate[]): SelectDocCateItem[] {
  return docCates.map(toSelectDocCateItem)
}

export function toFetchSelectDocsResult(
  result: FetchDocsResult
): FetchSelectDocsResult {
  return {
    docs: result.docs.map(doc => ({
      id: doc.id,
      filename: doc.filename,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      createdAt: doc.createdAt.toISOString()
    })),
    total: result.total
  }
}
