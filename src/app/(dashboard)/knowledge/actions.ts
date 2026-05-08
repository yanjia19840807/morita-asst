'use server'

import { revalidatePath } from 'next/cache'
import type { Knowledge } from '@/generated/prisma/client'
import { createKnowledge } from '@/data-access/knowledge'
import { ResponseResult } from '@/lib/api/shared/response'
import {
  handleActionError,
  handleActionResult
} from '@/lib/api/server/response'
import { KnowledgeCreateFormValues } from '@/schemas/knowledge'

const knowledgePath = '/knowledge'

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
