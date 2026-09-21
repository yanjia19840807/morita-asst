'use server'

import type { Agent } from '@/generated/prisma/client'
import { revalidatePath } from 'next/cache'

import type { AgentCreateFormValues, AgentEditFormValues } from './schemas'
import { createAgent, editAgent } from './service'
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

export async function editAgentAction(
  data: AgentEditFormValues
): Promise<ResponseResult<Agent>> {
  try {
    const result = await editAgent(data)
    revalidatePath(agentsPath)
    revalidatePath(`${agentsPath}/${data.id}`)
    revalidatePath(`${agentsPath}/${data.id}/edit`)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}
