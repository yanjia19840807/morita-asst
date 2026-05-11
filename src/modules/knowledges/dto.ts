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

export type KnowledgesWithTotalDto = {
  knowledges: KnowledgeRowDto[]
  total: number
}

export type KnowledgeDocListItemDto = {
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

export type KnowledgeDocListItem = KnowledgeDocListItemDto

export type FetchKnowledgeDocsListResultDto = {
  docs: KnowledgeDocListItemDto[]
  total: number
}

export type FetchKnowledgeDocsListResult = FetchKnowledgeDocsListResultDto
