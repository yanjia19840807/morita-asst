import { KnowledgeDocStatus, Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { NotFoundError, ValidationError } from '@/lib/api/errors'
import type { PaginationParams } from '@/lib/query'
import type {
  FetchKnowledgeChunksParams,
  FetchKnowledgeDocsParams,
  KnowledgeCreateFormValues,
  KnowledgeDocSourceValues,
  KnowledgeSourceModeValues
} from './schemas'
import { KNOWLEDGE_SOURCE_MODE } from './schemas'

export type KnowledgeOption = Prisma.KnowledgeGetPayload<{
  select: {
    id: true
    name: true
    description: true
  }
}>

export type KnowledgeRow = Prisma.KnowledgeGetPayload<{
  include: {
    user: {
      select: {
        id: true
        name: true
      }
    }
    docCate: {
      select: {
        id: true
        name: true
        slug: true
      }
    }
    _count: {
      select: {
        knowledgeDocs: true
      }
    }
  }
}>

export type KnowledgeWithDocs = Prisma.KnowledgeGetPayload<{
  include: {
    docCate: {
      select: {
        id: true
      }
    }
    knowledgeDocs: {
      include: {
        doc: {
          select: {
            id: true
            storageKey: true
          }
        }
      }
    }
  }
}>

export type FetchKnowledgesResult = {
  knowledges: KnowledgeRow[]
  total: number
}

export type KnowledgeDocRow = Prisma.KnowledgeDocGetPayload<{
  include: {
    doc: {
      include: {
        docCate: {
          select: {
            id: true
            name: true
            slug: true
          }
        }
      }
    }
  }
}>

export type KnowledgeIngestTarget = Prisma.KnowledgeGetPayload<{
  select: {
    id: true
    knowledgeDocs: {
      select: {
        id: true
        status: true
        doc: {
          select: {
            id: true
            storageKey: true
          }
        }
      }
    }
  }
}>

export type KnowledgeDocIngestTarget = Prisma.KnowledgeDocGetPayload<{
  select: {
    id: true
    knowledgeId: true
    status: true
    doc: {
      select: {
        id: true
        storageKey: true
      }
    }
  }
}>

export type KnowledgeDocStatusCount = {
  status: KnowledgeDocStatus
  count: number
}

export type KnowledgeDocProcessingStatus = Extract<
  KnowledgeDocStatus,
  'LOADING' | 'SPLITTING' | 'EMBEDDING'
>

export type PersistKnowledgeDocChunkInput = {
  id: string
  content: string
  metadata: Prisma.InputJsonValue
}

export type FetchKnowledgeDocsResult = {
  docs: KnowledgeDocRow[]
  total: number
}

export type KnowledgeChunkRow = {
  id: string
  knowledgeDocId: string
  content: string
  metadata: Prisma.JsonValue
  vector: string | null
  createdAt: Date
  updatedAt: Date
  docId: string
  filename: string
  mimeType: string | null
}

export type FetchKnowledgeChunksResult = {
  chunks: KnowledgeChunkRow[]
  total: number
}

export type FetchKnowledgesParams = PaginationParams

export async function findAllKnowledges(): Promise<KnowledgeOption[]> {
  return prisma.knowledge.findMany({
    select: {
      id: true,
      name: true,
      description: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function findKnowledges({
  page = 1,
  pageSize = 12,
  searchField,
  searchValue
}: PaginationParams): Promise<FetchKnowledgesResult> {
  const where: Prisma.KnowledgeWhereInput = {
    ...(searchValue
      ? {
          ...(searchField === 'name'
            ? {
                name: {
                  contains: searchValue,
                  mode: 'insensitive'
                }
              }
            : searchField === 'description'
              ? {
                  description: {
                    contains: searchValue,
                    mode: 'insensitive'
                  }
                }
              : {
                  OR: [
                    {
                      name: {
                        contains: searchValue,
                        mode: 'insensitive'
                      }
                    },
                    {
                      description: {
                        contains: searchValue,
                        mode: 'insensitive'
                      }
                    }
                  ]
                })
        }
      : {})
  }

  const [knowledges, total] = await Promise.all([
    prisma.knowledge.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        docCate: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            knowledgeDocs: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.knowledge.count({ where })
  ])

  return { knowledges, total }
}

export async function findKnowledgeById(id: string): Promise<KnowledgeRow> {
  const knowledge = await prisma.knowledge.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      },
      docCate: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      _count: {
        select: {
          knowledgeDocs: true
        }
      }
    }
  })

  if (!knowledge) {
    throw new NotFoundError('知识库')
  }

  return knowledge
}

export async function deleteKnowledgeRecord(id: string) {
  const knowledge = await prisma.knowledge.findUnique({
    where: { id },
    select: { id: true, name: true }
  })

  if (!knowledge) {
    throw new NotFoundError('知识库')
  }

  await prisma.knowledge.delete({
    where: { id }
  })

  return knowledge
}

export async function findKnowledgeIngestTarget(knowledgeId: string) {
  return prisma.knowledge.findUnique({
    where: { id: knowledgeId },
    select: {
      id: true,
      knowledgeDocs: {
        select: {
          id: true,
          status: true,
          doc: {
            select: {
              id: true,
              storageKey: true
            }
          }
        }
      }
    }
  })
}

export async function findKnowledgeDocIngestTarget(knowledgeDocId: string) {
  return prisma.knowledgeDoc.findUnique({
    where: { id: knowledgeDocId },
    select: {
      id: true,
      knowledgeId: true,
      status: true,
      doc: {
        select: {
          id: true,
          storageKey: true
        }
      }
    }
  })
}

export async function findKnowledgeDocStatusCounts(
  knowledgeId: string
): Promise<KnowledgeDocStatusCount[] | null> {
  const knowledge = await prisma.knowledge.findUnique({
    where: { id: knowledgeId },
    select: {
      id: true
    }
  })

  if (!knowledge) {
    return null
  }

  const grouped = await prisma.knowledgeDoc.groupBy({
    by: ['status'],
    where: { knowledgeId },
    _count: {
      _all: true
    }
  })

  return grouped.map(item => ({
    status: item.status,
    count: item._count._all
  }))
}

export async function replaceKnowledgeDocChunks(
  knowledgeDocId: string,
  chunks: PersistKnowledgeDocChunkInput[]
) {
  return prisma.$transaction(async tx => {
    await tx.chunk.deleteMany({
      where: { knowledgeDocId }
    })

    if (chunks.length > 0) {
      await tx.chunk.createMany({
        data: chunks.map(chunk => ({
          id: chunk.id,
          knowledgeDocId,
          content: chunk.content,
          metadata: chunk.metadata
        }))
      })
    }

    return tx.knowledgeDoc.update({
      where: { id: knowledgeDocId },
      data: {
        errorMessage: null,
        chunkCount: chunks.length
      }
    })
  })
}

export async function updateKnowledgeDocStatus(
  knowledgeDocId: string,
  status: KnowledgeDocProcessingStatus
) {
  return prisma.knowledgeDoc.update({
    where: { id: knowledgeDocId },
    data: {
      status,
      errorMessage: null
    }
  })
}

export async function updateKnowledgeDocReady(
  knowledgeDocId: string,
  chunkCount: number
) {
  return prisma.knowledgeDoc.update({
    where: { id: knowledgeDocId },
    data: {
      status: KnowledgeDocStatus.READY,
      errorMessage: null,
      chunkCount,
      lastIndexedAt: new Date()
    }
  })
}

export async function updateKnowledgeDocFailed(
  knowledgeDocId: string,
  errorMessage: string
) {
  return prisma.knowledgeDoc.update({
    where: { id: knowledgeDocId },
    data: {
      status: KnowledgeDocStatus.FAILED,
      errorMessage
    }
  })
}

export async function findKnowledgeDocs(
  params: FetchKnowledgeDocsParams
): Promise<FetchKnowledgeDocsResult> {
  const {
    knowledgeId,
    searchField,
    searchValue,
    sortBy = 'createdAt',
    sortDirection = 'desc',
    page = 1,
    pageSize = 10
  } = params

  const where: Prisma.KnowledgeDocWhereInput = {
    knowledgeId,
    ...(searchField === 'filename' && searchValue
      ? {
          doc: {
            filename: {
              contains: searchValue,
              mode: 'insensitive'
            }
          }
        }
      : {})
  }

  const orderBy: Prisma.KnowledgeDocOrderByWithRelationInput =
    sortBy === 'filename'
      ? { doc: { filename: sortDirection } }
      : { [sortBy]: sortDirection }

  const [docs, total] = await Promise.all([
    prisma.knowledgeDoc.findMany({
      where,
      include: {
        doc: {
          include: {
            docCate: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.knowledgeDoc.count({ where })
  ])

  return { docs, total }
}

export async function findKnowledgeChunks(
  params: FetchKnowledgeChunksParams
): Promise<FetchKnowledgeChunksResult> {
  const {
    knowledgeId,
    searchValue,
    sortBy = 'updatedAt',
    sortDirection = 'desc',
    page = 1,
    pageSize = 10
  } = params

  const offset = (page - 1) * pageSize
  const searchPattern = searchValue ? `%${searchValue}%` : null
  const sortColumn =
    sortBy === 'createdAt'
      ? Prisma.sql`c."createdAt"`
      : Prisma.sql`c."updatedAt"`
  const sortDirectionSql =
    sortDirection === 'asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`
  const searchClause = searchPattern
    ? Prisma.sql`
        AND (
          c."content" ILIKE ${searchPattern}
          OR CAST(c."metadata" AS text) ILIKE ${searchPattern}
          OR COALESCE(CAST(c."vector" AS text), '') ILIKE ${searchPattern}
          OR d."filename" ILIKE ${searchPattern}
        )
      `
    : Prisma.empty

  const [chunks, totalResult] = await Promise.all([
    prisma.$queryRaw<KnowledgeChunkRow[]>(Prisma.sql`
      SELECT
        c."id",
        c."knowledgeDocId",
        c."content",
        c."metadata",
        CAST(c."vector" AS text) AS "vector",
        c."createdAt",
        c."updatedAt",
        d."id" AS "docId",
        d."filename",
        d."mimeType"
      FROM "chunk" c
      INNER JOIN "knowledge-doc" kd ON kd."id" = c."knowledgeDocId"
      INNER JOIN "doc" d ON d."id" = kd."docId"
      WHERE kd."knowledgeId" = ${knowledgeId}
      ${searchClause}
      ORDER BY ${sortColumn} ${sortDirectionSql}, c."id" DESC
      LIMIT ${pageSize}
      OFFSET ${offset}
    `),
    prisma.$queryRaw<Array<{ total: bigint }>>(Prisma.sql`
      SELECT COUNT(*)::bigint AS total
      FROM "chunk" c
      INNER JOIN "knowledge-doc" kd ON kd."id" = c."knowledgeDocId"
      INNER JOIN "doc" d ON d."id" = kd."docId"
      WHERE kd."knowledgeId" = ${knowledgeId}
      ${searchClause}
    `)
  ])

  const total = Number(totalResult[0]?.total ?? 0)

  return { chunks, total }
}

async function resolveDocsFromSource(docSource: KnowledgeDocSourceValues) {
  if (docSource.mode === KNOWLEDGE_SOURCE_MODE.DOC_CATE) {
    const category = await prisma.docCate.findFirst({
      where: {
        id: docSource.categoryId
      },
      select: {
        id: true
      }
    })

    if (!category) {
      throw new NotFoundError('文档类目')
    }

    const docs = await prisma.doc.findMany({
      where: {
        docCateId: docSource.categoryId
      },
      select: {
        id: true
      }
    })

    return {
      docCateId: docSource.categoryId,
      docIds: docs.map(doc => doc.id)
    }
  }

  const selectedDocIds = docSource.docIds
  const docs = await prisma.doc.findMany({
    where: {
      id: {
        in: selectedDocIds
      }
    },
    select: {
      id: true
    }
  })

  if (docs.length !== selectedDocIds.length) {
    throw new NotFoundError('文档')
  }

  return {
    docCateId: null,
    docIds: selectedDocIds
  }
}

export async function createKnowledgeRecord(
  input: KnowledgeCreateFormValues & { userId: string }
): Promise<KnowledgeWithDocs> {
  const { userId, name, description, docSource } = input
  const sourceMode: KnowledgeSourceModeValues = docSource.mode
  const { docCateId, docIds } = await resolveDocsFromSource(docSource)

  try {
    return await prisma.$transaction(async tx => {
      const knowledge = await tx.knowledge.create({
        data: {
          userId,
          name,
          description,
          sourceMode,
          docCateId
        }
      })

      if (docIds.length > 0) {
        await tx.knowledgeDoc.createMany({
          data: docIds.map(docId => ({
            knowledgeId: knowledge.id,
            docId
          }))
        })
      }

      return tx.knowledge.findUniqueOrThrow({
        where: { id: knowledge.id },
        include: {
          docCate: {
            select: {
              id: true
            }
          },
          knowledgeDocs: {
            include: {
              doc: {
                select: {
                  id: true,
                  storageKey: true
                }
              }
            }
          }
        }
      })
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ValidationError('同名知识库已存在')
    }

    throw error
  }
}

export async function updateKnowledgeRecord(input: {
  id: string
  name: string
  description: string
}): Promise<{ id: string; name: string; description: string | null }> {
  const knowledge = await prisma.knowledge.findUnique({
    where: { id: input.id },
    select: { id: true }
  })

  if (!knowledge) {
    throw new NotFoundError('知识库')
  }

  try {
    return await prisma.knowledge.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description
      },
      select: {
        id: true,
        name: true,
        description: true
      }
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ValidationError('同名知识库已存在')
    }

    throw error
  }
}

export async function addKnowledgeDocsRecord(
  knowledgeId: string,
  docSource: KnowledgeDocSourceValues
): Promise<KnowledgeDocIngestTarget[]> {
  const knowledge = await prisma.knowledge.findUnique({
    where: { id: knowledgeId },
    select: { id: true }
  })

  if (!knowledge) {
    throw new NotFoundError('知识库')
  }

  const { docIds } = await resolveDocsFromSource(docSource)

  if (docIds.length === 0) {
    throw new ValidationError('所选范围没有可添加的文档')
  }

  const existing = await prisma.knowledgeDoc.findMany({
    where: {
      knowledgeId,
      docId: {
        in: docIds
      }
    },
    select: {
      docId: true
    }
  })

  const existingSet = new Set(existing.map(item => item.docId))
  const newDocIds = docIds.filter(docId => !existingSet.has(docId))

  if (newDocIds.length === 0) {
    throw new ValidationError('所选文档已全部关联到当前知识库')
  }

  await prisma.knowledgeDoc.createMany({
    data: newDocIds.map(docId => ({
      knowledgeId,
      docId
    })),
    skipDuplicates: true
  })

  return findKnowledgeDocsIngestTargetsByDocIds(knowledgeId, newDocIds)
}

export async function removeKnowledgeDocRecord(
  knowledgeId: string,
  knowledgeDocId: string
) {
  const knowledgeDoc = await prisma.knowledgeDoc.findFirst({
    where: {
      id: knowledgeDocId,
      knowledgeId
    },
    select: {
      id: true,
      knowledgeId: true,
      status: true,
      doc: {
        select: {
          filename: true
        }
      }
    }
  })

  if (!knowledgeDoc) {
    throw new NotFoundError('知识库文档')
  }

  if (
    knowledgeDoc.status === KnowledgeDocStatus.LOADING ||
    knowledgeDoc.status === KnowledgeDocStatus.SPLITTING ||
    knowledgeDoc.status === KnowledgeDocStatus.EMBEDDING
  ) {
    throw new ValidationError('该文档正在索引中，请稍后再试')
  }

  await prisma.knowledgeDoc.delete({
    where: { id: knowledgeDoc.id }
  })

  return {
    id: knowledgeDoc.id,
    knowledgeId: knowledgeDoc.knowledgeId,
    filename: knowledgeDoc.doc.filename
  }
}

export async function findKnowledgeDocsIngestTargets(ids: string[]) {
  if (ids.length === 0) {
    return []
  }

  return prisma.knowledgeDoc.findMany({
    where: {
      id: {
        in: ids
      }
    },
    select: {
      id: true,
      knowledgeId: true,
      status: true,
      doc: {
        select: {
          id: true,
          storageKey: true
        }
      }
    }
  })
}

async function findKnowledgeDocsIngestTargetsByDocIds(
  knowledgeId: string,
  docIds: string[]
) {
  if (docIds.length === 0) {
    return []
  }

  return prisma.knowledgeDoc.findMany({
    where: {
      knowledgeId,
      docId: {
        in: docIds
      }
    },
    select: {
      id: true,
      knowledgeId: true,
      status: true,
      doc: {
        select: {
          id: true,
          storageKey: true
        }
      }
    }
  })
}
