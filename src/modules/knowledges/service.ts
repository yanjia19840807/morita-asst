import type { Knowledge } from '@/generated/prisma/client'
import { requireRoles } from '@/modules/auth/service'
import { ValidationError } from '@/lib/api/errors'
import { sendKnowledgeIngest } from './indexing/service'
import { formatZodError } from '../../lib/zod'
import {
  createKnowledgeRecord,
  findAllKnowledges,
  findKnowledgeById,
  findKnowledgeChunks,
  findKnowledgeDocs,
  findKnowledges,
  type FetchKnowledgeChunksResult,
  type FetchKnowledgeDocsResult,
  type FetchKnowledgesParams,
  type FetchKnowledgesResult,
  type KnowledgeOption,
  type KnowledgeRow
} from './repository'
import {
  fetchKnowledgeChunksParamsSchema,
  type FetchKnowledgeChunksParams,
  fetchKnowledgeDocsParamsSchema,
  knowledgeCreateSchema,
  type FetchKnowledgeDocsParams,
  type KnowledgeCreateFormValues
} from './schemas'

export type {
  FetchKnowledgeChunksResult,
  FetchKnowledgeDocsResult,
  FetchKnowledgesParams,
  FetchKnowledgesResult,
  KnowledgeDocRow,
  KnowledgeIngestTarget,
  KnowledgeDocIngestTarget,
  KnowledgeOption,
  KnowledgeRow
} from './repository'

export async function fetchAllKnowledges(): Promise<KnowledgeOption[]> {
  await requireRoles(['admin'])
  return findAllKnowledges()
}

export async function fetchKnowledges(
  params: FetchKnowledgesParams
): Promise<FetchKnowledgesResult> {
  await requireRoles(['admin'])
  return findKnowledges(params)
}

export async function fetchKnowledgeById(id: string): Promise<KnowledgeRow> {
  await requireRoles(['admin'])
  return findKnowledgeById(id)
}

export async function fetchKnowledgeDocs(
  params: FetchKnowledgeDocsParams
): Promise<FetchKnowledgeDocsResult> {
  await requireRoles(['admin'])

  const validation = fetchKnowledgeDocsParamsSchema.safeParse(params)
  if (!validation.success) {
    throw new ValidationError(formatZodError(validation.error))
  }

  return findKnowledgeDocs(validation.data)
}

export async function fetchKnowledgeChunks(
  params: FetchKnowledgeChunksParams
): Promise<FetchKnowledgeChunksResult> {
  await requireRoles(['admin'])

  const validation = fetchKnowledgeChunksParamsSchema.safeParse(params)
  if (!validation.success) {
    throw new ValidationError(formatZodError(validation.error))
  }

  return findKnowledgeChunks(validation.data)
}

export async function createKnowledge(
  data: KnowledgeCreateFormValues
): Promise<Knowledge> {
  const user = await requireRoles(['admin'])
  const validation = knowledgeCreateSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(formatZodError(validation.error))
  }

  const knowledge = await createKnowledgeRecord({
    ...validation.data,
    userId: user.id
  })

  void sendKnowledgeIngest(knowledge.id).catch(error => {
    console.error(`Failed to enqueue knowledge ${knowledge.id}:`, error)
  })

  return knowledge
}
