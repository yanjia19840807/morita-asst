import type {
  FetchKnowledgeChunksResult,
  FetchKnowledgeDocsResult,
  fetchKnowledgeById
} from './service'
import type {
  FetchKnowledgeChunkListWithTotalDto,
  FetchKnowledgeDocListWithTotalDto,
  KnowledgeDetailDto,
  KnowledgeChunkListItemDto,
  KnowledgeDocListItemDto
} from './dto'

function toCompactJson(value: unknown) {
  return typeof value === 'string' ? value : JSON.stringify(value)
}

export function toKnowledgeDto(
  knowledge: Awaited<ReturnType<typeof fetchKnowledgeById>>
): KnowledgeDetailDto {
  return {
    id: knowledge.id,
    name: knowledge.name,
    description: knowledge.description,
    sourceMode: knowledge.sourceMode,
    createdAt: knowledge.createdAt.toISOString(),
    updatedAt: knowledge.updatedAt.toISOString(),
    user: {
      id: knowledge.user.id,
      name: knowledge.user.name
    },
    docCate: knowledge.docCate
      ? {
          id: knowledge.docCate.id,
          name: knowledge.docCate.name,
          slug: knowledge.docCate.slug
        }
      : null,
    _count: {
      knowledgeDocs: knowledge._count.knowledgeDocs
    }
  }
}

export function toKnowledgeDocListItemDto(
  knowledgeDoc: FetchKnowledgeDocsResult['docs'][number]
): KnowledgeDocListItemDto {
  return {
    id: knowledgeDoc.id,
    knowledgeId: knowledgeDoc.knowledgeId,
    status: knowledgeDoc.status,
    chunkCount: knowledgeDoc.chunkCount,
    errorMessage: knowledgeDoc.errorMessage ?? null,
    lastIndexedAt: knowledgeDoc.lastIndexedAt?.toISOString() ?? null,
    createdAt: knowledgeDoc.createdAt.toISOString(),
    updatedAt: knowledgeDoc.updatedAt.toISOString(),
    docId: knowledgeDoc.doc.id,
    filename: knowledgeDoc.doc.filename,
    fileSize: knowledgeDoc.doc.fileSize,
    mimeType: knowledgeDoc.doc.mimeType,
    docCreatedAt: knowledgeDoc.doc.createdAt.toISOString(),
    docCateId: knowledgeDoc.doc.docCate?.id ?? null,
    docCateName: knowledgeDoc.doc.docCate?.name ?? null,
    docCateSlug: knowledgeDoc.doc.docCate?.slug ?? null
  }
}

export function toFetchKnowledgeDocsListResult(
  result: FetchKnowledgeDocsResult
): FetchKnowledgeDocListWithTotalDto {
  return {
    docs: result.docs.map(toKnowledgeDocListItemDto),
    total: result.total
  }
}

export function toKnowledgeChunkListItemDto(
  chunk: FetchKnowledgeChunksResult['chunks'][number]
): KnowledgeChunkListItemDto {
  return {
    id: chunk.id,
    knowledgeDocId: chunk.knowledgeDocId,
    content: chunk.content,
    metadata: toCompactJson(chunk.metadata),
    vector: chunk.vector,
    createdAt: chunk.createdAt.toISOString(),
    updatedAt: chunk.updatedAt.toISOString(),
    docId: chunk.docId,
    filename: chunk.filename,
    mimeType: chunk.mimeType
  }
}

export function toFetchKnowledgeChunksListDto(
  result: FetchKnowledgeChunksResult
): FetchKnowledgeChunkListWithTotalDto {
  return {
    chunks: result.chunks.map(toKnowledgeChunkListItemDto),
    total: result.total
  }
}
