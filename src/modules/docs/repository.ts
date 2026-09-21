import { pinyin } from 'pinyin-pro'
import type { DocCate, Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { NotFoundError, ValidationError } from '@/lib/api/errors'
import type { DocCreateValues, FetchDocsParams } from './schemas'

export type DocRow = Prisma.DocGetPayload<{
  include: {
    knowledgeDocs: {
      select: {
        id: true
        knowledgeId: true
        status: true
      }
      orderBy: {
        createdAt: 'desc'
      }
    }
    _count: {
      select: {
        knowledgeDocs: true
      }
    }
  }
}>

export type FetchDocsResult = {
  docs: DocRow[]
  total: number
}

export type DocDetail = Prisma.DocGetPayload<{
  include: {
    docCate: {
      select: {
        id: true
        name: true
      }
    }
    _count: {
      select: {
        knowledgeDocs: true
      }
    }
  }
}>

type CreateDocRecordInput = Pick<DocCreateValues, 'categoryId' | 'files'> & {
  userId: string
}

export type DocCateRow = Prisma.DocCateGetPayload<{
  include: {
    _count: {
      select: {
        docs: true
      }
    }
  }
}>

async function generateUniqueSlug(
  name: string,
  excludeId?: string
): Promise<string> {
  const base =
    pinyin(name, {
      toneType: 'none',
      separator: '-',
      nonZh: 'consecutive'
    })
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'cate'

  const existing = await prisma.docCate.findMany({
    where: {
      slug: { startsWith: base },
      ...(excludeId ? { id: { not: excludeId } } : {})
    },
    select: { slug: true }
  })

  if (!existing.some(record => record.slug === base)) return base

  const slugs = new Set(existing.map(record => record.slug))
  let index = 1
  while (slugs.has(`${base}-${index}`)) index++
  return `${base}-${index}`
}

export async function createDocs(input: CreateDocRecordInput) {
  const { userId, categoryId, files } = input

  return prisma.doc.createMany({
    data: files.map(({ filename, fileSize, mimeType, storageKey }) => ({
      userId,
      docCateId: categoryId,
      filename,
      fileSize,
      mimeType,
      storageKey
    }))
  })
}

export async function findDocs(
  input: FetchDocsParams
): Promise<FetchDocsResult> {
  const {
    searchField = 'filename',
    searchValue,
    categoryId,
    sortBy = 'createdAt',
    sortDirection = 'desc',
    page = 1,
    pageSize = 10
  } = input

  const where: Prisma.DocWhereInput = {
    ...(categoryId ? { docCateId: categoryId } : {}),
    ...(searchField === 'filename' && searchValue
      ? {
          filename: {
            contains: searchValue,
            mode: 'insensitive'
          }
        }
      : {})
  }

  const orderBy = {
    [sortBy]: sortDirection
  }

  const [docs, total] = await Promise.all([
    prisma.doc.findMany({
      where,
      include: {
        knowledgeDocs: {
          select: {
            id: true,
            knowledgeId: true,
            status: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            knowledgeDocs: true
          }
        }
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.doc.count({ where })
  ])

  return { docs, total }
}

export async function findDocById(id: string): Promise<DocDetail> {
  const doc = await prisma.doc.findFirst({
    where: { id },
    include: {
      docCate: {
        select: {
          id: true,
          name: true
        }
      },
      _count: {
        select: {
          knowledgeDocs: true
        }
      }
    }
  })

  if (!doc) {
    throw new NotFoundError('文档')
  }

  return doc
}

export async function deleteDocs(ids: string[]) {
  const docs = await prisma.doc.deleteMany({
    where: {
      id: { in: ids }
    }
  })

  return docs
}

export async function createDocCateRecord(input: {
  userId: string
  name: string
}): Promise<DocCate> {
  const { userId, name } = input
  const slug = await generateUniqueSlug(name)
  const maxOrder = await prisma.docCate.aggregate({
    where: {
      isDefault: false
    },
    _max: {
      order: true
    }
  })
  const nextOrder = (maxOrder._max.order ?? 0) + 1

  try {
    return await prisma.docCate.create({
      data: { userId, name, slug, order: nextOrder }
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ValidationError('同名类目已存在')
    }

    throw error
  }
}

export async function updateDocCateRecord(input: {
  id: string
  name: string
}): Promise<DocCate> {
  const { id, name } = input
  const category = await prisma.docCate.findUnique({
    where: { id },
    select: { id: true }
  })

  if (!category) {
    throw new NotFoundError('文档类目')
  }

  const slug = await generateUniqueSlug(name, id)

  try {
    return await prisma.docCate.update({
      data: { name, slug },
      where: { id }
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ValidationError('同名类目已存在')
    }

    throw error
  }
}

export async function deleteDocCateRecord(id: string) {
  const category = await prisma.docCate.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      isDefault: true,
      _count: {
        select: {
          docs: true
        }
      }
    }
  })

  if (!category) {
    throw new NotFoundError('文档类目')
  }

  if (category.isDefault) {
    throw new ValidationError('默认类目不能删除')
  }

  await prisma.docCate.delete({
    where: { id }
  })

  return category
}

export async function findDocCates(): Promise<DocCateRow[]> {
  return prisma.docCate.findMany({
    include: {
      _count: {
        select: {
          docs: true
        }
      }
    },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
  })
}

export async function reorderDocCateRecords(input: {
  sourceId: string
  targetId: string
}): Promise<DocCate[]> {
  const { sourceId, targetId } = input
  const categories = await findDocCates()

  const sourceCate = categories.find(category => category.id === sourceId)
  const targetCate = categories.find(category => category.id === targetId)

  if (!sourceCate || !targetCate) {
    return categories
  }

  if (sourceCate.order === targetCate.order) {
    return categories
  }

  if (sourceCate.order < targetCate.order) {
    await prisma.$transaction([
      prisma.docCate.updateMany({
        where: {
          isDefault: false,
          order: {
            gt: sourceCate.order,
            lte: targetCate.order
          }
        },
        data: {
          order: {
            decrement: 1
          }
        }
      }),
      prisma.docCate.update({
        where: {
          id: sourceCate.id
        },
        data: {
          order: targetCate.order
        }
      })
    ])
  } else {
    await prisma.$transaction([
      prisma.docCate.updateMany({
        where: {
          isDefault: false,
          order: {
            gte: targetCate.order,
            lt: sourceCate.order
          }
        },
        data: {
          order: {
            increment: 1
          }
        }
      }),
      prisma.docCate.update({
        where: {
          id: sourceCate.id
        },
        data: {
          order: targetCate.order
        }
      })
    ])
  }

  return findDocCates()
}
