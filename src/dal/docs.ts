import { pinyin } from 'pinyin-pro'
import { prisma } from '@/lib/prisma'
import { DocCate } from '@/generated/prisma/client'
import type { Prisma } from '@/generated/prisma/client'
import {
  DocCateCreateFormValues,
  docCateCreateFormSchema,
  DocCateEditFormValues,
  docCateEditFormSchema,
  DocCateReorderValues,
  docCateReorderSchema,
  docCreateSchema,
  DocCreateValues,
  fetchDocsParamsSchema,
  FetchDocsParams
} from '@/schemas/doc'
import { requireRoles } from './auth'
import { ValidationError } from '@/lib/api/server/errors'
import z from 'zod'

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

async function generateUniqueSlug(name: string): Promise<string> {
  const base = pinyin(name, {
    toneType: 'none',
    separator: '-',
    nonZh: 'consecutive'
  })
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const existing = await prisma.docCate.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true }
  })

  if (!existing.some(r => r.slug === base)) return base

  const slugs = new Set(existing.map(r => r.slug))
  let i = 1
  while (slugs.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}

export async function createDoc(data: DocCreateValues) {
  const user = await requireRoles(['admin'])
  const validation = docCreateSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const { categoryId, files } = validation.data
  const userId = user.id

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

export async function fetchDocs(
  params: FetchDocsParams
): Promise<FetchDocsResult> {
  await requireRoles(['admin'])

  const validation = fetchDocsParamsSchema.safeParse(params)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const {
    searchField,
    searchValue,
    categoryId,
    sortBy = 'createdAt',
    sortDirection = 'desc',
    page = 1,
    pageSize = 10
  } = params

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

export async function createDocCate(data: DocCateCreateFormValues) {
  const user = await requireRoles(['admin'])
  const validation = docCateCreateFormSchema.safeParse(data)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const { name } = validation.data
  const slug = await generateUniqueSlug(name)
  const userId = user.id
  const maxOrder = await prisma.docCate.aggregate({
    where: {
      isDefault: false
    },
    _max: {
      order: true
    }
  })
  const nextOrder = (maxOrder._max.order ?? 0) + 1

  return prisma.docCate.create({
    data: { userId, name, slug, order: nextOrder }
  })
}

export async function editDocCate(data: DocCateEditFormValues) {
  await requireRoles(['admin'])
  const validation = docCateEditFormSchema.safeParse(data)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const { id, name } = validation.data
  const slug = await generateUniqueSlug(name)

  return prisma.docCate.update({
    data: { name, slug },
    where: { id }
  })
}

export async function fetchDocCates(): Promise<DocCate[]> {
  await requireRoles(['admin'])

  return prisma.docCate.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
  })
}

export async function reorderDocCates(
  data: DocCateReorderValues
): Promise<DocCate[]> {
  await requireRoles(['admin'])
  const validation = docCateReorderSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const { sourceId, targetId } = validation.data
  const categories = await prisma.docCate.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
  })

  const sourceCate = categories.find(category => category.id === sourceId)
  const targetCate = categories.find(category => category.id === targetId)

  if (!sourceCate || !targetCate) {
    throw new ValidationError('排序数据无效')
  }

  if (sourceCate.isDefault || targetCate.isDefault) {
    throw new ValidationError('默认类目不能拖动')
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

  return prisma.docCate.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
  })
}
