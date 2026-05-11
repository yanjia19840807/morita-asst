'use server'

import { revalidatePath } from 'next/cache'
import type { Knowledge } from '@/generated/prisma/client'
import {
  ResponseResult,
  handleActionResult,
  handleActionError
} from '@/lib/api/response'
import type { KnowledgeCreateFormValues } from './schemas'
import { createKnowledge } from './service'

const knowledgePath = '/knowledges'

export async function createKnowledgeAction(
  data: KnowledgeCreateFormValues
): Promise<ResponseResult<Knowledge>> {
  try {
    const result = await createKnowledge(data)
    revalidatePath(knowledgePath)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}
