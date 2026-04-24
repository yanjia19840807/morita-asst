import type {
  DocumentModel,
  DocumentCategoryModel,
  ChunkModel
} from '@/generated/prisma/models'

export type Document = DocumentModel
export type DocumentCategory = DocumentCategoryModel
export type Chunk = ChunkModel

export type DocumentWithCategory = Document & {
  category: DocumentCategory | null
}

export type DocumentWithRelations = Document & {
  category: DocumentCategory | null
  chunks: Chunk[]
}
