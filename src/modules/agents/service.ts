import { requireRoles } from '@/modules/auth/service'
import { paginationSchema, type PaginationParams } from '@/lib/query'
import z from 'zod'
import {
  createAgentRecord,
  findAgentFormOptions,
  findAgents,
  type AgentFormOptions,
  type AgentsWithTotal
} from './repository'
import { agentCreateSchema, type AgentCreateFormValues } from './schemas'
import { ValidationError } from '@/lib/api/errors'

export type { AgentFormOptions, AgentRow, AgentsWithTotal } from './repository'

export async function fetchAgents(
  params: PaginationParams
): Promise<AgentsWithTotal> {
  await requireRoles(['admin'])

  const validation = paginationSchema.safeParse(params)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  return findAgents(validation.data)
}

export async function fetchAgentFormOptions(): Promise<AgentFormOptions> {
  const user = await requireRoles(['admin'])
  return findAgentFormOptions(user.id)
}

export async function createAgent(data: AgentCreateFormValues) {
  const user = await requireRoles(['admin'])
  const validation = agentCreateSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  return createAgentRecord({
    ...validation.data,
    userId: user.id
  })
}
