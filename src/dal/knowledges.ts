import { prisma } from '@/lib/prisma'
import { Prisma, type Knowledge } from '@/generated/prisma/client'
import { requireRoles } from './auth'
import {
  fetchKnowledgeDocsParamsSchema,
  KNOWLEDGE_SOURCE_MODE,
  type FetchKnowledgeDocsParams,
  KnowledgeCreateFormValues,
  type KnowledgeSourceModeValues,
  knowledgeCreateSchema
} from '@/schemas/knowledge'
import { NotFoundError, ValidationError } from '@/lib/api/server/errors'
import z from 'zod'
import { PaginationParams } from '@/schemas/query'

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

export type KnowLedgesWithTotal = {
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

export type FetchKnowledgeDocsResult = {
  docs: KnowledgeDocRow[]
  total: number
}

export type fetchKnowledgesParams = {
  page?: number
  pageSize?: number
  searchField?: string
  searchValue?: string
}

export async function fetchAllKnowledges(): Promise<KnowledgeOption[]> {
  await requireRoles(['admin'])
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

export async function fetchKnowledges({
  page = 1,
  pageSize = 12,
  searchField,
  searchValue
}: PaginationParams): Promise<KnowLedgesWithTotal> {
  await requireRoles(['admin'])

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

export async function fetchKnowledgeById(id: string): Promise<KnowledgeRow> {
  await requireRoles(['admin'])

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

export async function fetchKnowledgeDocs(
  params: FetchKnowledgeDocsParams
): Promise<FetchKnowledgeDocsResult> {
  await requireRoles(['admin'])

  const validation = fetchKnowledgeDocsParamsSchema.safeParse(params)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const {
    knowledgeId,
    searchField,
    searchValue,
    sortBy = 'createdAt',
    sortDirection = 'desc',
    page = 1,
    pageSize = 10
  } = validation.data

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

export async function createKnowledge(
  data: KnowledgeCreateFormValues
): Promise<Knowledge> {
  const user = await requireRoles(['admin'])
  const validation = knowledgeCreateSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const { name, description, docSource } = validation.data

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
        docCateId: docCateId
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
          userId: user.id,
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

      return knowledge
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
