import { MessageRole, Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { NotFoundError } from '@/lib/api/errors'
import type { ChatCitationsPayload } from './schemas'

const agentChatInclude = {
  promptProfile: {
    select: {
      id: true,
      name: true,
      systemPrompt: true
    }
  },
  knowledge: {
    select: {
      id: true,
      name: true
    }
  }
} satisfies Prisma.AgentInclude

export type AgentChatContext = Prisma.AgentGetPayload<{
  include: typeof agentChatInclude
}>

export type ConversationMessage = Prisma.MessageGetPayload<{
  select: {
    id: true
    role: true
    content: true
    citations: true
    createdAt: true
  }
}>

export async function findAgentChatContext(
  agentId: string
): Promise<AgentChatContext> {
  const agent = await prisma.agent.findFirst({
    where: { id: agentId },
    include: agentChatInclude
  })

  if (!agent) {
    throw new NotFoundError('助手')
  }

  return agent
}

export async function findOrCreateConversation(agentId: string, userId: string) {
  const where = {
    agentId_userId: {
      agentId,
      userId
    }
  } as const

  const existing = await prisma.conversation.findUnique({ where })
  if (existing) {
    return existing
  }

  try {
    return await prisma.conversation.create({
      data: { agentId, userId }
    })
  } catch (error) {
    const isUniqueConflict =
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002') ||
      (error instanceof Error &&
        /unique constraint/i.test(error.message))

    if (isUniqueConflict) {
      return prisma.conversation.findUniqueOrThrow({ where })
    }

    throw error
  }
}

export async function findConversationMessages(conversationId: string) {
  return prisma.message.findMany({
    where: { conversationId },
    select: {
      id: true,
      role: true,
      content: true,
      citations: true,
      createdAt: true
    },
    orderBy: { createdAt: 'asc' }
  })
}

export async function createConversationMessage(data: {
  conversationId: string
  role: MessageRole
  content: string
  citations?: ChatCitationsPayload | null
}) {
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId: data.conversationId,
        role: data.role,
        content: data.content,
        citations: data.citations === undefined ? undefined : data.citations
      },
      select: {
        id: true,
        role: true,
        content: true,
        citations: true,
        createdAt: true
      }
    }),
    prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() }
    })
  ])

  return message
}

export async function clearConversationMessages(conversationId: string) {
  await prisma.message.deleteMany({
    where: { conversationId }
  })
}

export async function findReadyKnowledgeDocs(knowledgeId: string) {
  return prisma.knowledgeDoc.findMany({
    where: {
      knowledgeId,
      status: 'READY'
    },
    select: {
      id: true,
      doc: {
        select: {
          id: true,
          filename: true
        }
      }
    }
  })
}

export async function findKnowledgeChunksForRetrieve(
  knowledgeDocIds: string[],
  query: string,
  limit: number
) {
  const terms = extractSearchTerms(query)
  const baseWhere = {
    knowledgeDocId: { in: knowledgeDocIds }
  }

  const matched =
    terms.length > 0
      ? await prisma.chunk.findMany({
          where: {
            ...baseWhere,
            OR: terms.map(term => ({
              content: {
                contains: term,
                mode: 'insensitive' as const
              }
            }))
          },
          select: {
            id: true,
            content: true,
            knowledgeDocId: true
          },
          take: limit
        })
      : []

  if (matched.length > 0) {
    return matched
  }

  return prisma.chunk.findMany({
    where: baseWhere,
    select: {
      id: true,
      content: true,
      knowledgeDocId: true
    },
    orderBy: { createdAt: 'asc' },
    take: limit
  })
}

function extractSearchTerms(query: string) {
  const tokens = query
    .split(/[^\p{L}\p{N}]+/u)
    .map(item => item.trim())
    .filter(item => item.length >= 2)

  const unique = [...new Set(tokens)]
  if (unique.length === 0 && query.trim().length >= 2) {
    return [query.trim()]
  }

  return unique.slice(0, 8)
}
