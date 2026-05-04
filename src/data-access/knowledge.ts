import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma/client'
import { requireRoles } from './auth'

export type KnowledgeRow = Prisma.KnowledgeGetPayload<{
  include: {
    _count: {
      select: {
        documents: true
      }
    }
  }
}>

export type fetchKnowledgesParams = {
  page?: number
  pageSize?: number
  searchValue?: string
}

export async function fetchKnowledges({
  page = 1,
  pageSize = 12,
  searchValue
}: fetchKnowledgesParams): Promise<{
  knowledges: KnowledgeRow[]
  total: number
}> {
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
