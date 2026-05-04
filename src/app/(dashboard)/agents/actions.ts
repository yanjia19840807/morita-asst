'use server'

import { revalidatePath } from 'next/cache'
import {
  handleActionError,
  handleActionResult,
  ResponseResult
} from '@/lib/api/response'
import { createAgent } from '@/data-access/agent'
import { AgentCreateFormValues } from '@/schemas/agent'
import type { Agent } from '@/generated/prisma/client'

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
