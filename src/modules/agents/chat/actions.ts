'use server'

import { revalidatePath } from 'next/cache'
import {
  handleActionError,
  handleActionResult,
  type ResponseResult
} from '@/lib/api/response'
import { clearAgentChatThread } from './service'

export async function clearAgentChatAction(
  agentId: string
): Promise<ResponseResult<{ conversationId: string }>> {
  try {
    const result = await clearAgentChatThread(agentId)
    revalidatePath(`/agents/${agentId}/chat`)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}
