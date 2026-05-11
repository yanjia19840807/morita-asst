import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { NotFoundError, ValidationError } from '@/lib/api/errors'
import type { PaginationParams } from '@/lib/query'
import type {
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

export type KnowLedgeWithDocs = Prisma.KnowledgeGetPayload<{
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

export type KnowLedgesWithTotal = FetchKnowledgesResult

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

export type FetchKnowledgesParams = PaginationParams

export type fetchKnowledgesParams = FetchKnowledgesParams

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

export async function createKnowledgeRecord(
  input: KnowledgeCreateFormValues & { userId: string }
): Promise<KnowLedgeWithDocs> {
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
