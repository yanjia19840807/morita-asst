'use server'

import type { Agent } from '@/generated/prisma/client'
import { revalidatePath } from 'next/cache'

import type { AgentCreateFormValues } from './schemas'
import { createAgent } from './service'
import {
  handleActionError,
  handleActionResult,
  ResponseResult
} from '@/lib/api/response'

const agentsPath = '/agents'

export async function createAgentAction(
  data: AgentCreateFormValues
): Promise<ResponseResult<Agent>> {
  try {
    const result = await createAgent(data)
    revalidatePath(agentsPath)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}
