import type { Prisma } from '@/generated/prisma/client'
import { NotFoundError, ValidationError } from '@/lib/api/server/errors'
import { prisma } from '@/lib/prisma'
import { AgentCreateFormValues, agentCreateSchema } from '@/schemas/agent'
import { requireRoles } from './auth'
import z from 'zod'

export type AgentRow = Prisma.AgentGetPayload<{
  include: {
    promptProfile: {
      select: {
        id: true
        name: true
      }
    }
    _count: {
      select: {
        knowledges: true
      }
    }
  }
}>

export type FetchAgentsParams = {
  page?: number
  pageSize?: number
  searchValue?: string
}

export async function fetchAgents({
  page = 1,
  pageSize = 12,
  searchValue
}: FetchAgentsParams): Promise<{
  agents: AgentRow[]
  total: number
}> {
  const user = await requireRoles(['admin'])

  const where: Prisma.AgentWhereInput = {
    userId: user.id,
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

  const [agents, total] = await Promise.all([
    prisma.agent.findMany({
      where,
      include: {
        promptProfile: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            knowledges: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.agent.count({ where })
  ])

  return { agents, total }
}

export async function fetchAgentFormOptions() {
  const user = await requireRoles(['admin'])

  const [promptProfiles, knowledges] = await Promise.all([
    prisma.promptProfile.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    }),
    prisma.knowledge.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        description: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
  ])

  return { promptProfiles, knowledges }
}

export async function createAgent(data: AgentCreateFormValues) {
  const user = await requireRoles(['admin'])
  const validation = agentCreateSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const { name, description, status, model, promptProfileId, knowledgeIds } =
    validation.data

  const existingAgent = await prisma.agent.findFirst({
    where: {
      userId: user.id,
      name
    },
    select: {
      id: true
    }
  })

  if (existingAgent) {
    throw new ValidationError('同名助手已存在')
  }

  if (promptProfileId) {
    const promptProfile = await prisma.promptProfile.findFirst({
      where: {
        id: promptProfileId,
        userId: user.id
      },
      select: {
        id: true
      }
    })

    if (!promptProfile) {
      throw new NotFoundError('PromptProfile')
    }
  }

  if (knowledgeIds.length > 0) {
    const matchedKnowledges = await prisma.knowledge.findMany({
      where: {
        userId: user.id,
        id: {
          in: knowledgeIds
        }
      },
      select: {
        id: true
      }
    })

    if (matchedKnowledges.length !== new Set(knowledgeIds).size) {
      throw new NotFoundError('Knowledge')
    }
  }

  return prisma.agent.create({
    data: {
      userId: user.id,
      name,
      description: description || null,
      status,
      model: model || null,
      promptProfileId: promptProfileId || null,
      knowledges: {
        create: Array.from(new Set(knowledgeIds)).map((knowledgeId, index) => ({
          knowledgeId,
          priority: index + 1
        }))
      }
    }
  })
}
