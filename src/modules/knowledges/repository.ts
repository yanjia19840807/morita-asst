import { KnowledgeDocStatus, Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { NotFoundError, ValidationError } from '@/lib/api/errors'
import type { PaginationParams } from '@/lib/query'
import type {
  FetchKnowledgeChunksParams,
  FetchKnowledgeDocsParams,
  KnowledgeCreateFormValues,
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
    throw new NotFoundError('Knowledge')
  }

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

export async function createKnowledgeRecord(
  input: KnowledgeCreateFormValues & { userId: string }
): Promise<KnowledgeWithDocs> {
  const { userId, name, description, docSource } = input

  let docCateId: string | null = null
  let docIds: string[] = []
  const sourceMode: KnowledgeSourceModeValues = docSource.mode

  if (docSource.mode === KNOWLEDGE_SOURCE_MODE.DOC_CATE) {
    docCateId = docSource.categoryId

    const category = await prisma.docCate.findFirst({
      where: {
        id: docCateId
      },
      select: {
        id: true
      }
    })

    if (!category) {
      throw new NotFoundError('DocCate')
    }

    const docs = await prisma.doc.findMany({
      where: {
        docCateId
      },
      select: {
        id: true
      }
    })

    docIds = docs.map(doc => doc.id)
  } else {
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
      throw new NotFoundError('Doc')
    }

    docIds = selectedDocIds
  }

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
