import type { FetchKnowledgeDocsResult } from './service'
import type {
  FetchKnowledgeDocsListResultDto,
  KnowledgeDocListItemDto
} from './dto'

export function toKnowledgeDocListItemDto(
  knowledgeDoc: FetchKnowledgeDocsResult['docs'][number]
): KnowledgeDocListItemDto {
  return {
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
  }
}

export function toFetchKnowledgeDocsListResult(
  result: FetchKnowledgeDocsResult
): FetchKnowledgeDocsListResultDto {
  return {
    docs: result.docs.map(toKnowledgeDocListItemDto),
    total: result.total
  }
}
