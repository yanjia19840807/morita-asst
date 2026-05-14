export type KnowledgeOptionDto = {
  id: string
  name: string
  description: string | null
}

export type KnowledgeUserDto = {
  id: string
  name: string
}

export type KnowledgeCateDto = {
  id: string
  name: string
  slug: string
}

export type KnowledgeRowDto = {
  id: string
  name: string
  description: string | null
  sourceMode: 'DOC_CATE' | 'DOC'
  createdAt: Date
  updatedAt: Date
  user: KnowledgeUserDto
  docCate: KnowledgeCateDto | null
  _count: {
    knowledgeDocs: number
  }
}

export type KnowledgeDetailDto = {
  id: string
  name: string
  description: string | null
  sourceMode: 'DOC_CATE' | 'DOC'
  createdAt: string
  updatedAt: string
  user: KnowledgeUserDto
  docCate: KnowledgeCateDto | null
  _count: {
    knowledgeDocs: number
  }
}

export type KnowledgesWithTotalDto = {
  knowledges: KnowledgeRowDto[]
  total: number
}

export type KnowledgeDocListItemDto = {
  id: string
  knowledgeId: string
  status: string
  chunkCount: number
  errorMessage: string | null
  lastIndexedAt: string | null
  createdAt: string
  updatedAt: string
  docId: string
  filename: string
  fileSize: number | null
  mimeType: string | null
  docCreatedAt: string
  docCateId: string | null
  docCateName: string | null
  docCateSlug: string | null
}

export type FetchKnowledgeDocListWithTotalDto = {
  docs: KnowledgeDocListItemDto[]
  total: number
}

export type KnowledgeChunkListItemDto = {
  id: string
  knowledgeDocId: string
  content: string
  metadata: string
  vector: string | null
  createdAt: string
  updatedAt: string
  docId: string
  filename: string
  mimeType: string | null
}

export type FetchKnowledgeChunkListWithTotalDto = {
  chunks: KnowledgeChunkListItemDto[]
  total: number
}
