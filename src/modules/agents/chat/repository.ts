import { MessageRole, Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { NotFoundError } from '@/lib/api/errors'
import type { ChatRun } from './schemas'

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
    run: true
    createdAt: true
  }
}>

const messageSelect = {
  id: true,
  role: true,
  content: true,
  citations: true,
  run: true,
  createdAt: true
} satisfies Prisma.MessageSelect

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

export async function listAgentConversations(agentId: string, userId: string) {
  return prisma.conversation.findMany({
    where: { agentId, userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { messages: true }
      }
    }
  })
}

export async function createAgentConversation(agentId: string, userId: string) {
  return prisma.conversation.create({
    data: { agentId, userId },
    include: {
      _count: {
        select: { messages: true }
      }
    }
  })
}

export async function findAgentConversation(
  conversationId: string,
  agentId: string,
  userId: string
) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, agentId, userId }
  })

  if (!conversation) {
    throw new NotFoundError('试聊')
  }

  return conversation
}

export async function findConversationMessages(conversationId: string) {
  return prisma.message.findMany({
    where: { conversationId },
    select: messageSelect,
    orderBy: { createdAt: 'asc' }
  })
}

export async function createConversationMessage(data: {
  conversationId: string
  role: MessageRole
  content: string
  run?: ChatRun
}) {
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId: data.conversationId,
        role: data.role,
        content: data.content,
        run: data.run
      },
      select: messageSelect
    }),
    prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() }
    })
  ])

  return message
}

export async function setConversationTitleIfEmpty(
  conversationId: string,
  title: string
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { title: true }
  })

  if (!conversation || conversation.title) {
    return conversation?.title ?? null
  }

  const updated = await prisma.conversation.update({
    where: { id: conversationId },
    data: { title },
    select: { title: true }
  })

  return updated.title
}

export async function deleteMessagesAfter(
  conversationId: string,
  messageIds: string[]
) {
  if (messageIds.length === 0) {
    return
  }

  await prisma.message.deleteMany({
    where: {
      conversationId,
      id: { in: messageIds }
    }
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

export async function countReadyKnowledgeChunks(knowledgeDocIds: string[]) {
  if (knowledgeDocIds.length === 0) {
    return 0
  }

  return prisma.chunk.count({
    where: {
      knowledgeDocId: { in: knowledgeDocIds }
    }
  })
}

export async function findReadyChunksByTerms(
  knowledgeDocIds: string[],
  terms: string[],
  limit: number
) {
  if (knowledgeDocIds.length === 0 || terms.length === 0) {
    return []
  }

  return prisma.chunk.findMany({
    where: {
      knowledgeDocId: { in: knowledgeDocIds },
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
}
