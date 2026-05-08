import type { FetchKnowledgeDocumentsResult } from '@/dal/knowledges'

export type KnowledgeDocumentListItem = {
  id: string
  status: string
  chunkCount: number
  errorMessage: string | null
  lastIndexedAt: string | null
  createdAt: string
  updatedAt: string
  document: {
    id: string
    filename: string
    fileSize: number | null
    mimeType: string | null
    createdAt: string
    category: {
      id: string
      name: string
      slug: string
    } | null
  }
}

export type FetchKnowledgeDocumentsListResult = {
  documents: KnowledgeDocumentListItem[]
  total: number
}

export function toFetchKnowledgeDocumentsListResult(
  result: FetchKnowledgeDocumentsResult
): FetchKnowledgeDocumentsListResult {
  return {
    documents: result.documents.map(knowledgeDocument => ({
      id: knowledgeDocument.id,
      status: knowledgeDocument.status,
      chunkCount: knowledgeDocument.chunkCount,
      errorMessage: knowledgeDocument.errorMessage ?? null,
      lastIndexedAt: knowledgeDocument.lastIndexedAt?.toISOString() ?? null,
      createdAt: knowledgeDocument.createdAt.toISOString(),
      updatedAt: knowledgeDocument.updatedAt.toISOString(),
      document: {
        id: knowledgeDocument.document.id,
        filename: knowledgeDocument.document.filename,
        fileSize: knowledgeDocument.document.fileSize,
        mimeType: knowledgeDocument.document.mimeType,
        createdAt: knowledgeDocument.document.createdAt.toISOString(),
        category: knowledgeDocument.document.category
          ? {
              id: knowledgeDocument.document.category.id,
              name: knowledgeDocument.document.category.name,
              slug: knowledgeDocument.document.category.slug
            }
          : null
      }
    })),
    total: result.total
  }
}
