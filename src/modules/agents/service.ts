import { requireRoles } from '@/modules/auth/service'
import { paginationSchema, type PaginationParams } from '@/lib/query'
import {
  createAgentRecord,
  findAgentById,
  findAgentFormOptions,
  findAgents,
  updateAgentRecord,
  type AgentFormOptions,
  type AgentsWithTotal
} from './repository'
import {
  agentCreateSchema,
  agentEditSchema,
  agentIdSchema,
  type AgentCreateFormValues,
  type AgentEditFormValues
} from './schemas'
import { ValidationError } from '@/lib/api/errors'
import { formatZodError } from '../../lib/zod'

export type { AgentFormOptions, AgentRow, AgentsWithTotal } from './repository'

export async function fetchAgents(
  params: PaginationParams
): Promise<AgentsWithTotal> {
  await requireRoles(['admin'])

  const validation = paginationSchema.safeParse(params)
  if (!validation.success) {
    throw new ValidationError(formatZodError(validation.error))
  }

  return findAgents(validation.data)
}

export async function fetchAgentFormOptions(): Promise<AgentFormOptions> {
  const user = await requireRoles(['admin'])
  return findAgentFormOptions(user.id)
}

export async function fetchAgentById(id: string) {
  await requireRoles(['admin'])
  const validation = agentIdSchema.safeParse(id)

  if (!validation.success) {
    throw new ValidationError(formatZodError(validation.error))
  }

  return findAgentById(validation.data)
}

export async function createAgent(data: AgentCreateFormValues) {
  const user = await requireRoles(['admin'])
  const validation = agentCreateSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(formatZodError(validation.error))
  }

  return createAgentRecord({
    ...validation.data,
    userId: user.id
  })
}

export async function editAgent(data: AgentEditFormValues) {
  const user = await requireRoles(['admin'])
  const validation = agentEditSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(formatZodError(validation.error))
  }

  return updateAgentRecord({
    ...validation.data,
    userId: user.id
  })
}
