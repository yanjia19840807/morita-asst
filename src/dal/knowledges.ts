import { prisma } from '@/lib/prisma'
import { Prisma, type Knowledge } from '@/generated/prisma/client'
import { requireRoles } from './auth'
import {
  fetchKnowledgeDocumentsParamsSchema,
  KNOWLEDGE_SOURCE_MODE,
  type FetchKnowledgeDocumentsParams,
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
    _count: {
      select: {
        documents: true
      }
    }
  }
}>

export type KnowLedgesWithTotal = {
  knowledges: KnowledgeRow[]
  total: number
}

export type KnowledgeDetailRow = Prisma.KnowledgeGetPayload<{
  include: {
    user: {
      select: {
        id: true
        name: true
      }
    }
    category: {
      select: {
        id: true
        name: true
        slug: true
      }
    }
    _count: {
      select: {
        documents: true
      }
    }
  }
}>

export type KnowledgeDocumentRow = Prisma.KnowledgeDocumentGetPayload<{
  include: {
    document: {
      include: {
        category: {
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

export type FetchKnowledgeDocumentsResult = {
  documents: KnowledgeDocumentRow[]
  total: number
}

export type fetchKnowledgesParams = {
  page?: number
  pageSize?: number
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
  searchValue
}: PaginationParams): Promise<KnowLedgesWithTotal> {
  await requireRoles(['admin'])

  const where: Prisma.KnowledgeWhereInput = {
    ...(searchValue
      ? {
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
        }
      : {})
  }

  const [knowledges, total] = await Promise.all([
    prisma.knowledge.findMany({
      where,
      include: {
        _count: {
          select: {
            documents: true
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

export async function fetchKnowledgeById(
  id: string
): Promise<KnowledgeDetailRow> {
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
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      _count: {
        select: {
          documents: true
        }
      }
    }
  })

  if (!knowledge) {
    throw new NotFoundError('Knowledge')
  }

  return knowledge
}

export async function fetchKnowledgeDocuments(
  params: FetchKnowledgeDocumentsParams
): Promise<FetchKnowledgeDocumentsResult> {
  await requireRoles(['admin'])

  const validation = fetchKnowledgeDocumentsParamsSchema.safeParse(params)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const {
    knowledgeId,
    filename,
    sortBy = 'createdAt',
    sortDirection = 'desc',
    page = 1,
    pageSize = 10
  } = validation.data

  const where: Prisma.KnowledgeDocumentWhereInput = {
    knowledgeId,
    ...(filename
      ? {
          document: {
            filename: {
              contains: filename,
              mode: 'insensitive'
            }
          }
        }
      : {})
  }

  const orderBy: Prisma.KnowledgeDocumentOrderByWithRelationInput =
    sortBy === 'filename'
      ? { document: { filename: sortDirection } }
      : { [sortBy]: sortDirection }

  const [documents, total] = await Promise.all([
    prisma.knowledgeDocument.findMany({
      where,
      include: {
        document: {
          include: {
            category: {
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
    prisma.knowledgeDocument.count({ where })
  ])

  return { documents, total }
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

  let categoryId: string | null = null
  let documentIds: string[] = []
  const sourceMode: KnowledgeSourceModeValues = docSource.mode

  if (docSource.mode === KNOWLEDGE_SOURCE_MODE.DOC_CATE) {
    categoryId = docSource.categoryId

    const category = await prisma.documentCategory.findFirst({
      where: {
        id: categoryId
      },
      select: {
        id: true
      }
    })

    if (!category) {
      throw new NotFoundError('DocumentCategory')
    }

    const documents = await prisma.document.findMany({
      where: {
        categoryId
      },
      select: {
        id: true
      }
    })

    documentIds = documents.map(document => document.id)
  } else {
    const selectedDocumentIds = docSource.documentIds

    const documents = await prisma.document.findMany({
      where: {
        id: {
          in: selectedDocumentIds
        }
      },
      select: {
        id: true
      }
    })

    if (documents.length !== selectedDocumentIds.length) {
      throw new NotFoundError('Document')
    }

    documentIds = selectedDocumentIds
  }

  try {
    return await prisma.$transaction(async tx => {
      const knowledge = await tx.knowledge.create({
        data: {
          userId: user.id,
          name,
          description,
          sourceMode,
          categoryId
        }
      })

      if (documentIds.length > 0) {
        await tx.knowledgeDocument.createMany({
          data: documentIds.map(documentId => ({
            knowledgeId: knowledge.id,
            documentId
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
