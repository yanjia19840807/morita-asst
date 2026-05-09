import type { FetchKnowledgeDocsResult } from '@/dal/knowledges'

export type KnowledgeDocListItem = {
  id: string
  status: string
  chunkCount: number
  errorMessage: string | null
  lastIndexedAt: string | null
  createdAt: string
  updatedAt: string
  doc: {
    id: string
    filename: string
    fileSize: number | null
    mimeType: string | null
    createdAt: string
    docCate: {
      id: string
      name: string
      slug: string
    } | null
  }
}

export type FetchKnowledgeDocsListResult = {
  docs: KnowledgeDocListItem[]
  total: number
}

export function toFetchKnowledgeDocsListResult(
  result: FetchKnowledgeDocsResult
): FetchKnowledgeDocsListResult {
  return {
    docs: result.docs.map(knowledgeDoc => ({
      id: knowledgeDoc.id,
      status: knowledgeDoc.status,
      chunkCount: knowledgeDoc.chunkCount,
      errorMessage: knowledgeDoc.errorMessage ?? null,
      lastIndexedAt: knowledgeDoc.lastIndexedAt?.toISOString() ?? null,
      createdAt: knowledgeDoc.createdAt.toISOString(),
      updatedAt: knowledgeDoc.updatedAt.toISOString(),
      doc: {
        id: knowledgeDoc.doc.id,
        filename: knowledgeDoc.doc.filename,
        fileSize: knowledgeDoc.doc.fileSize,
        mimeType: knowledgeDoc.doc.mimeType,
        createdAt: knowledgeDoc.doc.createdAt.toISOString(),
        docCate: knowledgeDoc.doc.docCate
          ? {
              id: knowledgeDoc.doc.docCate.id,
              name: knowledgeDoc.doc.docCate.name,
              slug: knowledgeDoc.doc.docCate.slug
            }
          : null
      }
    })),
    total: result.total
  }
}
