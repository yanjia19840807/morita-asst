import type { Prisma } from '@/generated/prisma/client'
import { NotFoundError, ValidationError } from '@/lib/api/server/errors'
import { prisma } from '@/lib/prisma'
import { AgentCreateFormValues, agentCreateSchema } from '@/schemas/agent'
import { requireRoles } from './auth'
import z from 'zod'
import { PaginationParams, paginationSchema } from '@/schemas/query'

export type AgentRow = Prisma.AgentGetPayload<{
  include: {
    promptProfile: {
      select: {
        id: true
        name: true
      }
    }
    knowledge: {
      select: {
        id: true
        name: true
      }
    }
  }
}>

export type AgentsWithTotal = {
  agents: AgentRow[]
  total: number
}

export async function fetchAgents(
  params: PaginationParams
): Promise<AgentsWithTotal> {
  await requireRoles(['admin'])

  const validation = paginationSchema.safeParse(params)

  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const { page, pageSize, searchValue } = validation.data

  const where: Prisma.AgentWhereInput = {
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
        knowledge: {
          select: {
            id: true,
            name: true
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

  const { name, description, status, model, promptProfileId, knowledgeId } =
    validation.data

  const existingAgent = await prisma.agent.findFirst({
    where: {
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
        id: promptProfileId
      },
      select: {
        id: true
      }
    })

    if (!promptProfile) {
      throw new NotFoundError('提示词不存在')
    }
  }

  if (knowledgeId) {
    const matchedKnowledge = await prisma.knowledge.findFirst({
      where: {
        userId: user.id,
        id: knowledgeId
      },
      select: {
        id: true
      }
    })

    if (!matchedKnowledge) {
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
      knowledgeId: knowledgeId || null
    }
  })
}
