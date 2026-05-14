import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma'
import { Prisma } from '@/generated/prisma/client'
import { embeddings } from './embedding'
import { prisma } from './prisma'

type ChunkVectorModel = {
  id: string
  content: string
  metadata: Prisma.JsonValue
  knowledgeDocId: string
  vector?: unknown
}

let vectorStorePromise: Promise<
  ReturnType<
    ReturnType<typeof PrismaVectorStore.withModel<ChunkVectorModel>>['create']
  >
> | null = null

export function getVectorStore() {
  if (!vectorStorePromise) {
    vectorStorePromise = Promise.resolve(
      PrismaVectorStore.withModel<ChunkVectorModel>(prisma).create(embeddings, {
        prisma: Prisma,
        tableName: 'chunk' as unknown as 'Chunk',
        vectorColumnName: 'vector',
        columns: {
          id: PrismaVectorStore.IdColumn,
          content: PrismaVectorStore.ContentColumn,
          metadata: true,
          knowledgeDocId: true
        },
        columnTypes: {
          id: 'text',
          knowledgeDocId: 'text',
          metadata: 'jsonb'
        }
      })
    )
  }

  return vectorStorePromise
}
