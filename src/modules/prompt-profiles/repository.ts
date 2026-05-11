import type { Prisma, PromptProfile } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import type { PaginationParams } from '@/lib/query'
import type {
  PromptProfileCreateFormValues,
  PromptProfileEditFormValues
} from './schemas'
import { NotFoundError, ValidationError } from '@/lib/api/errors'

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

export type FetchPromptProfilesParams = PaginationParams

export type FetchPromptProfilesResult = {
  promptProfiles: PromptProfileRow[]
  total: number
}

const sortableFields = new Set(['name', 'createdAt', 'updatedAt'])

export async function findAllPromptProfiles(): Promise<PromptProfileOption[]> {
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

export async function findPromptProfiles({
  page = 1,
  pageSize = 10,
  searchValue,
  sortBy = 'updatedAt',
  sortDirection = 'desc'
}: FetchPromptProfilesParams): Promise<FetchPromptProfilesResult> {
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

export async function findPromptProfileById(
  id: string
): Promise<PromptProfile> {
  const promptProfile = await prisma.promptProfile.findFirst({
    where: {
      id
    }
  })

  if (!promptProfile) {
    throw new NotFoundError('PromptProfile')
  }

  return promptProfile
}

export async function createPromptProfileRecord(
  input: PromptProfileCreateFormValues & { userId: string }
) {
  const { userId, name, systemPrompt } = input

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
      userId,
      name,
      systemPrompt
    }
  })
}

export async function updatePromptProfileRecord(
  input: PromptProfileEditFormValues
) {
  const { id, name, systemPrompt } = input

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
