import { pinyin } from 'pinyin-pro'
import { prisma } from '@/lib/prisma'
import { Document, DocumentCategory } from '@/generated/prisma/client'
import type { Prisma } from '@/generated/prisma/client'
import {
  DocCateCreateFormValues,
  docCateCreateSchema,
  DocCateEditFormValues,
  docCateEditSchema,
  DocCateReorderValues,
  docCateReorderSchema,
  docCreateActionSchema,
  DocCreateActionValues
} from '@/schemas/doc'
import { requireRoles } from './auth'
import { ValidationError } from '@/lib/api/errors'
import z from 'zod'

async function generateUniqueSlug(name: string): Promise<string> {
  const base = pinyin(name, {
    toneType: 'none',
    separator: '-',
    nonZh: 'consecutive'
  })
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const existing = await prisma.documentCategory.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true }
  })

  if (!existing.some(r => r.slug === base)) return base

  const slugs = new Set(existing.map(r => r.slug))
  let i = 1
  while (slugs.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}

export async function createDoc(data: DocCreateActionValues) {
  const user = await requireRoles(['admin'])
  const validation = docCreateActionSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const { categoryId, files } = validation.data
  const userId = user.id

  return prisma.document.createMany({
    data: files.map(({ filename, fileSize, mimeType, storageKey }) => ({
      userId,
      categoryId,
      filename,
      fileSize,
      mimeType,
      storageKey
    }))
  })
}

export type fetchDocsParams = {
  filename?: string
  categoryId?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  page: number
  pageSize: number
}

export async function fetchDocs({
  filename,
  categoryId,
  sortBy = 'createdAt',
  sortDirection = 'desc',
  page = 1,
  pageSize = 10
}: fetchDocsParams): Promise<{
  documents: Document[]
  total: number
}> {
  const where: Prisma.DocumentWhereInput = {
    ...(categoryId ? { categoryId } : {}),
    ...(filename
      ? {
          filename: {
            contains: filename,
            mode: 'insensitive'
          }
        }
      : {})
  }
  const orderByField = sortBy
  const orderBy = {
    [orderByField]: sortDirection
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.document.count({ where })
  ])

  return { documents, total }
}

export async function createDocCate(data: DocCateCreateFormValues) {
  const user = await requireRoles(['admin'])
  const validation = docCateCreateSchema.safeParse(data)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const { name } = validation.data
  const slug = await generateUniqueSlug(name)
  const userId = user.id
  const maxOrder = await prisma.documentCategory.aggregate({
    where: {
      userId,
      isDefault: false
    },
    _max: {
      order: true
    }
  })
  const nextOrder = (maxOrder._max.order ?? 0) + 1

  return prisma.documentCategory.create({
    data: { userId, name, slug, order: nextOrder }
  })
}

export async function editDocCate(data: DocCateEditFormValues) {
  const user = await requireRoles(['admin'])
  const validation = docCateEditSchema.safeParse(data)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const { id, name } = validation.data
  const slug = await generateUniqueSlug(name)
  const userId = user.id

  return prisma.documentCategory.update({
    data: { userId, name, slug },
    where: { id }
  })
}

export async function fetchDocCates(): Promise<DocumentCategory[]> {
  const user = await requireRoles(['admin'])

  return prisma.documentCategory.findMany({
    where: {
      userId: user.id
    },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
  })
}

export async function reorderDocCates(
  data: DocCateReorderValues
): Promise<DocumentCategory[]> {
  await requireRoles(['admin'])
  const validation = docCateReorderSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const { sourceId, targetId } = validation.data
  const categories = await prisma.documentCategory.findMany({
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
      prisma.documentCategory.updateMany({
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
      prisma.documentCategory.update({
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
      prisma.documentCategory.updateMany({
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
      prisma.documentCategory.update({
        where: {
          id: sourceCate.id
        },
        data: {
          order: targetCate.order
        }
      })
    ])
  }

  return prisma.documentCategory.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
  })
}
