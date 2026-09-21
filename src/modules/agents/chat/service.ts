import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { MessageRole } from '@/generated/prisma/client'
import { ValidationError } from '@/lib/api/errors'
import { requireRoles } from '@/modules/auth/service'
import { createChatModel } from '../models/chat-deep-seek'
import { agentIdSchema } from '../schemas'
import {
  clearConversationMessages,
  createConversationMessage,
  findAgentChatContext,
  findConversationMessages,
  findOrCreateConversation,
  type ConversationMessage
} from './repository'
import { retrieveKnowledgeContext } from './retrieve'
import {
  chatCitationsPayloadSchema,
  chatSendSchema,
  type ChatCitation,
  type ChatCitationsPayload
} from './schemas'
import type { ChatMessageDto, ChatThreadDto } from './types'
import { formatZodError } from '@/lib/zod'

export type { ChatMessageDto, ChatThreadDto } from './types'

const HISTORY_LIMIT = 20

function textFromChunk(content: unknown) {
  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    return content
      .map(part => {
        if (typeof part === 'string') {
          return part
        }

        if (part && typeof part === 'object' && 'text' in part) {
          return typeof part.text === 'string' ? part.text : ''
        }

        return ''
      })
      .join('')
  }

  return ''
}

function formatRetrieveError(error: unknown) {
  const message = error instanceof Error ? error.message : ''

  if (/arrearage|overdue-payment|欠费/i.test(message)) {
    return '知识库检索失败：阿里云百炼账号欠费，已改为直接回答'
  }

  return '知识库检索失败，已改为直接回答'
}

function toCitationsPayload(
  citations: ConversationMessage['citations']
): ChatCitationsPayload | null {
  if (citations == null) {
    return null
  }

  const parsed = chatCitationsPayloadSchema.safeParse(citations)
  return parsed.success ? parsed.data : null
}

function toMessageDto(message: ConversationMessage): ChatMessageDto {
  const payload = toCitationsPayload(message.citations)

  return {
    id: message.id,
    role: message.role,
    content: message.content,
    citations: payload?.items ?? null,
    knowledgeMissed:
      payload !== null && payload.items.length === 0 && !payload.error,
    retrieveError: payload?.error ?? null,
    createdAt: message.createdAt.toISOString()
  }
}

function buildSystemPrompt(
  agentName: string,
  systemPrompt: string | undefined,
  contextText: string
) {
  const persona =
    systemPrompt?.trim() ||
    `你是「${agentName}」。当前没有绑定自定义提示词，请用简洁、准确的中文回答管理员的试聊问题。`

  if (!contextText) {
    return persona
  }

  return `${persona}

以下是从知识库检索到的参考内容，请优先依据这些材料回答。如果材料不足以回答，可以补充说明哪些部分不是来自知识库。

${contextText}`
}

export async function fetchAgentChatThread(
  agentId: string
): Promise<ChatThreadDto> {
  const user = await requireRoles(['admin'])
  const validation = agentIdSchema.safeParse(agentId)

  if (!validation.success) {
    throw new ValidationError(formatZodError(validation.error))
  }

  await findAgentChatContext(validation.data)
  const conversation = await findOrCreateConversation(validation.data, user.id)
  const messages = await findConversationMessages(conversation.id)

  return {
    conversationId: conversation.id,
    messages: messages.map(toMessageDto)
  }
}

export async function clearAgentChatThread(agentId: string) {
  const user = await requireRoles(['admin'])
  const validation = agentIdSchema.safeParse(agentId)

  if (!validation.success) {
    throw new ValidationError(formatZodError(validation.error))
  }

  await findAgentChatContext(validation.data)
  const conversation = await findOrCreateConversation(validation.data, user.id)
  await clearConversationMessages(conversation.id)

  return { conversationId: conversation.id }
}

export async function* streamAgentChat(agentId: string, content: unknown) {
  const user = await requireRoles(['admin'])
  const agentValidation = agentIdSchema.safeParse(agentId)
  const contentValidation = chatSendSchema.safeParse({ content })

  if (!agentValidation.success) {
    throw new ValidationError(formatZodError(agentValidation.error))
  }

  if (!contentValidation.success) {
    throw new ValidationError(formatZodError(contentValidation.error))
  }

  const agent = await findAgentChatContext(agentValidation.data)

  if (agent.status !== 'ACTIVE') {
    throw new ValidationError('仅启用中的助手可以试聊')
  }

  const conversation = await findOrCreateConversation(agent.id, user.id)
  await createConversationMessage({
    conversationId: conversation.id,
    role: MessageRole.USER,
    content: contentValidation.data.content
  })

  const history = (await findConversationMessages(conversation.id)).slice(
    -HISTORY_LIMIT
  )

  let citations: ChatCitation[] = []
  let contextText = ''
  let retrieveError: string | undefined
  const knowledgeBound = Boolean(agent.knowledgeId)

  if (agent.knowledgeId) {
    try {
      const retrieved = await retrieveKnowledgeContext(
        agent.knowledgeId,
        contentValidation.data.content,
        agent.model
      )
      citations = retrieved.citations
      contextText = retrieved.contextText
    } catch (error) {
      console.error('Knowledge retrieve failed:', error)
      retrieveError = formatRetrieveError(error)
    }
  }

  const llm = createChatModel(agent.model)
  const prompt = [
    new SystemMessage(
      buildSystemPrompt(agent.name, agent.promptProfile?.systemPrompt, contextText)
    ),
    ...history.map(message =>
      message.role === MessageRole.USER
        ? new HumanMessage(message.content)
        : new AIMessage(message.content)
    )
  ]

  let assistantContent = ''

  try {
    const stream = await llm.stream(prompt)

    for await (const chunk of stream) {
      const delta = textFromChunk(chunk.content)
      if (!delta) {
        continue
      }

      assistantContent += delta
      yield { type: 'delta' as const, text: delta }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '生成回复失败'
    throw new ValidationError(message)
  }

  if (!assistantContent.trim()) {
    throw new ValidationError('模型没有返回内容，请稍后重试')
  }

  const citationsPayload = knowledgeBound
    ? { items: citations, error: retrieveError }
    : null
  const saved = await createConversationMessage({
    conversationId: conversation.id,
    role: MessageRole.ASSISTANT,
    content: assistantContent,
    citations: citationsPayload
  })

  yield {
    type: 'done' as const,
    message: toMessageDto(saved)
  }
}
