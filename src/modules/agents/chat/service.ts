import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { MessageRole } from '@/generated/prisma/client'
import { NotFoundError, ValidationError } from '@/lib/api/errors'
import { requireRoles } from '@/modules/auth/service'
import { formatZodError } from '@/lib/zod'
import { resolveChatModel } from '../models/chat-models'
import { createChatModel } from '../models/chat-deep-seek'
import { agentIdSchema } from '../schemas'
import {
  createAgentConversation,
  createConversationMessage,
  deleteMessagesAfter,
  findAgentChatContext,
  findAgentConversation,
  findConversationMessages,
  listAgentConversations,
  setConversationTitleIfEmpty,
  type ConversationMessage
} from './repository'
import { retrieveKnowledgeContext } from './retrieve'
import {
  chatCitationsPayloadSchema,
  chatConversationIdSchema,
  chatRunSchema,
  chatSendSchema,
  type ChatCitation,
  type ChatRun
} from './schemas'
import type {
  ChatConversationSummary,
  ChatMessageDto,
  ChatThreadDto
} from './types'

export type { ChatMessageDto, ChatThreadDto } from './types'

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

function conversationTitle(content: string) {
  const text = content.replace(/\s+/g, ' ').trim()
  if (text.length <= 24) {
    return text
  }

  return `${text.slice(0, 24)}…`
}

function personaPrompt(agentName: string, systemPrompt?: string | null) {
  return (
    systemPrompt?.trim() ||
    `你是「${agentName}」。当前没有绑定自定义提示词，请用简洁、准确的中文回答管理员的试聊问题。`
  )
}

function buildSystemPrompt(persona: string, contextText: string) {
  if (!contextText) {
    return persona
  }

  return `${persona}

以下是从知识库检索到的参考内容，请优先依据这些材料回答。如果材料不足以回答，可以补充说明哪些部分不是来自知识库。

${contextText}`
}

function toSummary(conversation: {
  id: string
  title: string | null
  updatedAt: Date
  _count: { messages: number }
}): ChatConversationSummary {
  return {
    id: conversation.id,
    title: conversation.title || '新的试聊',
    updatedAt: conversation.updatedAt.toISOString(),
    messageCount: conversation._count.messages
  }
}

function legacyRun(citations: ConversationMessage['citations']): ChatRun | null {
  if (citations == null) {
    return null
  }

  const parsed = chatCitationsPayloadSchema.safeParse(citations)
  if (!parsed.success) {
    return null
  }

  const status = parsed.data.error
    ? 'error'
    : parsed.data.items.length > 0
      ? 'hit'
      : 'miss'

  return {
    recorded: false,
    model: '',
    temperature: 0,
    historyLimit: 0,
    retrieveTopK: 0,
    promptProfileId: null,
    promptName: null,
    systemPrompt: '',
    knowledgeId: null,
    knowledgeName: null,
    retrieve: {
      status,
      reason:
        parsed.data.error ??
        (status === 'miss' ? '未检索到知识库内容' : null),
      items: parsed.data.items
    }
  }
}

function toMessageDto(message: ConversationMessage): ChatMessageDto {
  const parsedRun = chatRunSchema.safeParse(message.run)

  return {
    id: message.id,
    role: message.role,
    content: message.content,
    run: parsedRun.success ? parsedRun.data : legacyRun(message.citations),
    createdAt: message.createdAt.toISOString()
  }
}

async function requireAgent(agentId: string) {
  const validation = agentIdSchema.safeParse(agentId)
  if (!validation.success) {
    throw new ValidationError(formatZodError(validation.error))
  }

  const agent = await findAgentChatContext(validation.data)
  return agent
}

export async function fetchAgentChatThread(
  agentId: string,
  conversationId?: string | null
): Promise<ChatThreadDto> {
  const user = await requireRoles(['admin'])
  const agent = await requireAgent(agentId)
  const conversations = await listAgentConversations(agent.id, user.id)
  const requested = conversationId
    ? chatConversationIdSchema.safeParse(conversationId)
    : null

  if (requested && !requested.success) {
    throw new ValidationError(formatZodError(requested.error))
  }

  const selected = requested?.success
    ? conversations.find(item => item.id === requested.data)
    : conversations[0]

  if (requested?.success && !selected) {
    throw new NotFoundError('试聊')
  }

  const messages = selected
    ? await findConversationMessages(selected.id)
    : []

  return {
    conversations: conversations.map(toSummary),
    conversationId: selected?.id ?? null,
    messages: messages.map(toMessageDto)
  }
}

export async function startAgentChatRound(agentId: string) {
  const user = await requireRoles(['admin'])
  const agent = await requireAgent(agentId)

  if (agent.status !== 'ACTIVE') {
    throw new ValidationError('仅启用中的助手可以试聊')
  }

  const conversation = await createAgentConversation(agent.id, user.id)
  return toSummary(conversation)
}

export async function* streamAgentChat(
  agentId: string,
  body: unknown,
  signal?: AbortSignal
) {
  const user = await requireRoles(['admin'])
  const agent = await requireAgent(agentId)
  const contentValidation = chatSendSchema.safeParse(body)

  if (!contentValidation.success) {
    throw new ValidationError(formatZodError(contentValidation.error))
  }

  if (agent.status !== 'ACTIVE') {
    throw new ValidationError('仅启用中的助手可以试聊')
  }

  const payload = contentValidation.data
  const conversation = payload.conversationId
    ? await findAgentConversation(payload.conversationId, agent.id, user.id)
    : await createAgentConversation(agent.id, user.id)

  let userMessage: ConversationMessage
  let title = conversation.title

  if (payload.retryOfMessageId) {
    const messages = await findConversationMessages(conversation.id)
    const targetIndex = messages.findIndex(
      message => message.id === payload.retryOfMessageId
    )
    const target = targetIndex >= 0 ? messages[targetIndex] : null

    if (!target || target.role !== MessageRole.USER) {
      throw new ValidationError('只能重试用户消息')
    }

    const following = messages.slice(targetIndex + 1)
    if (following.some(message => message.role === MessageRole.USER)) {
      throw new ValidationError('只能重试最近一条用户消息')
    }

    await deleteMessagesAfter(
      conversation.id,
      following.map(message => message.id)
    )
    userMessage = target
  } else {
    userMessage = await createConversationMessage({
      conversationId: conversation.id,
      role: MessageRole.USER,
      content: payload.content ?? ''
    })
  }

  if (!title) {
    const firstUser = (await findConversationMessages(conversation.id)).find(
      message => message.role === MessageRole.USER
    )
    title = await setConversationTitleIfEmpty(
      conversation.id,
      conversationTitle(firstUser?.content || userMessage.content)
    )
  }

  yield {
    type: 'start' as const,
    conversationId: conversation.id,
    title: title || conversationTitle(userMessage.content),
    userMessage: toMessageDto(userMessage)
  }

  if (signal?.aborted) {
    return
  }

  const history = (
    await findConversationMessages(conversation.id)
  ).slice(-agent.historyLimit)

  const persona = personaPrompt(agent.name, agent.promptProfile?.systemPrompt)
  let citations: ChatCitation[] = []
  let contextText = ''
  let retrieveStatus: ChatRun['retrieve']['status'] = 'skipped'
  let retrieveReason: string | null = '未绑定知识库'

  if (agent.knowledgeId) {
    try {
      const retrieved = await retrieveKnowledgeContext(
        agent.knowledgeId,
        userMessage.content,
        agent.retrieveTopK
      )
      citations = retrieved.citations
      contextText = retrieved.contextText
      retrieveStatus = retrieved.status
      retrieveReason = retrieved.reason
    } catch (error) {
      console.error('Knowledge retrieve failed:', error)
      retrieveStatus = 'error'
      retrieveReason =
        error instanceof Error && error.message
          ? `知识库检索失败：${error.message}`
          : '知识库检索失败，已改为直接回答'
    }
  }

  const model = resolveChatModel(agent.model)
  const llm = createChatModel(model, { temperature: agent.temperature })
  const prompt = [
    new SystemMessage(buildSystemPrompt(persona, contextText)),
    ...history.map(message =>
      message.role === MessageRole.USER
        ? new HumanMessage(message.content)
        : new AIMessage(message.content)
    )
  ]

  let assistantContent = ''

  try {
    const stream = await llm.stream(prompt, { signal })

    for await (const chunk of stream) {
      if (signal?.aborted) {
        return
      }

      const delta = textFromChunk(chunk.content)
      if (!delta) {
        continue
      }

      assistantContent += delta
      yield { type: 'delta' as const, text: delta }
    }
  } catch (error) {
    if (signal?.aborted) {
      return
    }

    const message = error instanceof Error ? error.message : '生成回复失败'
    throw new ValidationError(message)
  }

  if (signal?.aborted) {
    return
  }

  if (!assistantContent.trim()) {
    throw new ValidationError('模型没有返回内容，请稍后重试')
  }

  const run: ChatRun = {
    recorded: true,
    model,
    temperature: agent.temperature,
    historyLimit: agent.historyLimit,
    retrieveTopK: agent.retrieveTopK,
    promptProfileId: agent.promptProfile?.id ?? null,
    promptName: agent.promptProfile?.name ?? null,
    systemPrompt: persona,
    knowledgeId: agent.knowledge?.id ?? null,
    knowledgeName: agent.knowledge?.name ?? null,
    retrieve: {
      status: retrieveStatus,
      reason: retrieveReason,
      items: citations
    }
  }
  const saved = await createConversationMessage({
    conversationId: conversation.id,
    role: MessageRole.ASSISTANT,
    content: assistantContent,
    run
  })

  yield {
    type: 'done' as const,
    message: toMessageDto(saved)
  }
}
