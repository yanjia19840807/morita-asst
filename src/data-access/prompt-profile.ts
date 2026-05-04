import type { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { NotFoundError, ValidationError } from '@/lib/api/errors'
import {
  PromptProfileCreateFormValues,
  PromptProfileEditFormValues,
  promptProfileCreateSchema,
  promptProfileEditSchema,
  promptProfileIdSchema
} from '@/schemas/prompt-profile'
import { requireRoles } from './auth'
import z from 'zod'

export type PromptProfileRow = Prisma.PromptProfileGetPayload<{
  include: {
    _count: {
      select: {
        agents: true
      }
    }
  }
}>

export type FetchPromptProfilesParams = {
  page?: number
  pageSize?: number
  searchValue?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

const sortableFields = new Set(['name', 'createdAt', 'updatedAt'])

export async function fetchPromptProfiles({
  page = 1,
  pageSize = 10,
  searchValue,
  sortBy = 'updatedAt',
  sortDirection = 'desc'
}: FetchPromptProfilesParams): Promise<{
  promptProfiles: PromptProfileRow[]
  total: number
}> {
  const user = await requireRoles(['admin'])
  const keyword = searchValue?.trim()
  const orderByField = sortableFields.has(sortBy) ? sortBy : 'updatedAt'

  const where: Prisma.PromptProfileWhereInput = {
    userId: user.id,
    ...(keyword
      ? {
          OR: [
            {
              name: {
                contains: keyword,
                mode: 'insensitive'
              }
            },
            {
              systemPrompt: {
                contains: keyword,
                mode: 'insensitive'
              }
            }
          ]
        }
      : {})
  }

  const [promptProfiles, total] = await Promise.all([
    prisma.promptProfile.findMany({
      where,
      include: {
        _count: {
          select: {
            agents: true
          }
        }
      },
      orderBy: {
        [orderByField]: sortDirection
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.promptProfile.count({ where })
  ])

  return { promptProfiles, total }
}

export async function createPromptProfile(data: PromptProfileCreateFormValues) {
  const user = await requireRoles(['admin'])
  const validation = promptProfileCreateSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const { name, systemPrompt } = validation.data

  const existing = await prisma.promptProfile.findFirst({
    where: {
      userId: user.id,
      name
    },
    select: {
      id: true
    }
  })

  if (existing) {
    throw new ValidationError('同名提示词已存在')
  }

  return prisma.promptProfile.create({
    data: {
      userId: user.id,
      name,
      systemPrompt
    }
  })
}

export async function fetchPromptProfileById(id: string) {
  const user = await requireRoles(['admin'])
  const validation = promptProfileIdSchema.safeParse(id)

  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const promptProfile = await prisma.promptProfile.findFirst({
    where: {
      id: validation.data,
      userId: user.id
    }
  })

  if (!promptProfile) {
    throw new NotFoundError('PromptProfile')
  }

  return promptProfile
}

export async function editPromptProfile(data: PromptProfileEditFormValues) {
  const user = await requireRoles(['admin'])
  const validation = promptProfileEditSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const { id, name, systemPrompt } = validation.data

  const existing = await prisma.promptProfile.findFirst({
    where: {
      userId: user.id,
      name,
      id: {
        not: id
      }
    },
    select: {
      id: true
    }
  })

  if (existing) {
    throw new ValidationError('同名提示词已存在')
  }

  return prisma.promptProfile.update({
    where: {
      id
    },
    data: {
      name,
      systemPrompt
    }
  })
}
