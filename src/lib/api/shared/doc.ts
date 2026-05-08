import type { DocumentCategory } from '@/generated/prisma/client'
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
  documents: SelectDocItem[]
  total: number
}

export function toSelectDocCateItem(
  category: DocumentCategory
): SelectDocCateItem {
  return {
    id: category.id,
    name: category.name
  }
}

export function toSelectDocCateItems(
  categories: DocumentCategory[]
): SelectDocCateItem[] {
  return categories.map(toSelectDocCateItem)
}

export function toFetchSelectDocsResult(
  result: FetchDocsResult
): FetchSelectDocsResult {
  return {
    documents: result.documents.map(document => ({
      id: document.id,
      filename: document.filename,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      createdAt: document.createdAt.toISOString()
    })),
    total: result.total
  }
}
