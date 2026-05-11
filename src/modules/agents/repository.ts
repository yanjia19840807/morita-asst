import type { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import type { PaginationParams } from '@/lib/query'
import type { KnowledgeOption } from '@/modules/knowledges/service'
import type { PromptProfileOption } from '@/modules/prompt-profiles/service'
import type { AgentCreateFormValues } from './schemas'
import { NotFoundError, ValidationError } from '@/lib/api/errors'

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

export type AgentFormOptions = {
  promptProfiles: PromptProfileOption[]
  knowledges: KnowledgeOption[]
}

export async function findAgents({
  page = 1,
  pageSize = 10,
  searchValue
}: PaginationParams): Promise<AgentsWithTotal> {
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

export async function findAgentFormOptions(
  userId: string
): Promise<AgentFormOptions> {
  const [promptProfiles, knowledges] = await Promise.all([
    prisma.promptProfile.findMany({
      select: {
        id: true,
        name: true,
        description: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    }),
    prisma.knowledge.findMany({
      where: { userId },
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

export async function createAgentRecord(
  input: AgentCreateFormValues & { userId: string }
) {
  const {
    userId,
    name,
    description,
    status,
    model,
    promptProfileId,
    knowledgeId
  } = input

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
        userId,
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
      userId,
      name,
      description: description || null,
      status,
      model: model || null,
      promptProfileId: promptProfileId || null,
      knowledgeId: knowledgeId || null
    }
  })
}
