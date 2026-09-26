'use server'

import { revalidatePath } from 'next/cache'
import {
  handleActionError,
  handleActionResult,
  type ResponseResult
} from '@/lib/api/response'
import { startAgentChatRound } from './service'
import type { ChatConversationSummary } from './types'

export async function startAgentChatRoundAction(
  agentId: string
): Promise<ResponseResult<ChatConversationSummary>> {
  try {
    const result = await startAgentChatRound(agentId)
    revalidatePath(`/agents/${agentId}/chat`)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}
