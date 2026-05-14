'use server'

import { revalidatePath } from 'next/cache'
import {
  type ResponseResult,
  handleActionError,
  handleActionResult
} from '@/lib/api/response'
import type { SendKnowledgeDocResult, SendKnowledgeResult } from './service'
import { sendKnowledgeDocReindex, sendKnowledgeIngest } from './service'

export async function reindexKnowledgeAction(
  knowledgeId: string
): Promise<ResponseResult<SendKnowledgeResult>> {
  try {
    const result = await sendKnowledgeIngest(knowledgeId)
    revalidatePath('/knowledges')
    revalidatePath(`/knowledges/${knowledgeId}`)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function reindexKnowledgeDocAction(
  knowledgeDocId: string,
  knowledgeId: string
): Promise<ResponseResult<SendKnowledgeDocResult>> {
  try {
    const result = await sendKnowledgeDocReindex(knowledgeDocId)
    revalidatePath(`/knowledges/${knowledgeId}`)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}
