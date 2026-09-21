import type { ChatCitation } from './schemas'

export type ChatMessageDto = {
  id: string
  role: 'USER' | 'ASSISTANT'
  content: string
  citations: ChatCitation[] | null
  knowledgeMissed: boolean
  retrieveError: string | null
  createdAt: string
}

export type ChatThreadDto = {
  conversationId: string
  messages: ChatMessageDto[]
}
