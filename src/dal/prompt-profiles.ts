import type { Prisma, PromptProfile } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { NotFoundError, ValidationError } from '@/lib/api/server/errors'
import {
  PromptProfileCreateFormValues,
  PromptProfileEditFormValues,
  promptProfileCreateSchema,
  promptProfileEditSchema,
  promptProfileIdSchema
} from '@/schemas/prompt-profile'
import { requireRoles } from './auth'
import z from 'zod'

type PromptProfileListQueryRow = Prisma.PromptProfileGetPayload<{
  include: {
    _count: {
      select: {
        agents: true
      }
    }
  }
}>

export type PromptProfileOption = Prisma.PromptProfileGetPayload<{
  select: {
    id: true
    name: true
    description: true
  }
}>

export type PromptProfileRow = PromptProfile & {
  refAgentCount: number
}

export type FetchPromptProfilesParams = {
  page?: number
  pageSize?: number
  searchValue?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

const sortableFields = new Set(['name', 'createdAt', 'updatedAt'])

export async function fetchAllPromptProfiles(): Promise<PromptProfileOption[]> {
  await requireRoles(['admin'])
  return prisma.promptProfile.findMany({
    select: {
      id: true,
      name: true,
      description: true
    },
    orderBy: {
      name: 'asc'
    }
  })
}

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
  await requireRoles(['admin'])
  const keyword = searchValue?.trim()
  const orderByField = sortableFields.has(sortBy) ? sortBy : 'updatedAt'

  const where: Prisma.PromptProfileWhereInput = {
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

  return {
    promptProfiles: promptProfiles.map(
      ({ _count, ...promptProfile }: PromptProfileListQueryRow) => ({
        ...promptProfile,
        refAgentCount: _count.agents
      })
    ),
    total
  }
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
  await requireRoles(['admin'])
  const validation = promptProfileIdSchema.safeParse(id)

  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const promptProfile = await prisma.promptProfile.findFirst({
    where: {
      id: validation.data
    }
  })

  if (!promptProfile) {
    throw new NotFoundError('PromptProfile')
  }

  return promptProfile
}

export async function editPromptProfile(data: PromptProfileEditFormValues) {
  await requireRoles(['admin'])
  const validation = promptProfileEditSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const { id, name, systemPrompt } = validation.data

  const existing = await prisma.promptProfile.findFirst({
    where: {
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
