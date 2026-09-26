import type { ChatCitation, ChatRetrieveStatus, ChatRun } from './schemas'

export type ChatMessageDto = {
  id: string
  role: 'USER' | 'ASSISTANT'
  content: string
  run: ChatRun | null
  createdAt: string
}

export type ChatConversationSummary = {
  id: string
  title: string
  updatedAt: string
  messageCount: number
}

export type ChatThreadDto = {
  conversations: ChatConversationSummary[]
  conversationId: string | null
  messages: ChatMessageDto[]
}

export type ChatCitationView = ChatCitation
export type { ChatRetrieveStatus, ChatRun }
