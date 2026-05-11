export type DocCateDto = {
  id: string
  name: string
}

export type SelectDocCateItem = DocCateDto

export type DocKnowledgeRefDto = {
  id: string
  knowledgeId: string
  status: string
}

export type DocRowDto = {
  id: string
  filename: string
  fileSize: number | null
  mimeType: string | null
  createdAt: Date
  knowledgeDocs: DocKnowledgeRefDto[]
  _count: {
    knowledgeDocs: number
  }
}

export type DocListItemDto = {
  id: string
  filename: string
  fileSize: number | null
  mimeType: string | null
  createdAt: string
}

export type SelectDocItem = DocListItemDto

export type FetchDocsResponseDto = {
  docs: DocListItemDto[]
  total: number
}

export type FetchSelectDocsResult = FetchDocsResponseDto

export type FetchDocsResultDto = {
  docs: DocRowDto[]
  total: number
}
