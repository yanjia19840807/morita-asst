import type { Knowledge } from '@/generated/prisma/client'
import { requireRoles } from '@/modules/auth/service'
import { ValidationError } from '@/lib/api/errors'
import z from 'zod'
import {
  KnowLedgeWithDocs,
  createKnowledgeRecord,
  findAllKnowledges,
  findKnowledgeById,
  findKnowledgeDocs,
  findKnowledges,
  type FetchKnowledgeDocsResult,
  type FetchKnowledgesResult,
  type KnowledgeOption,
  type KnowledgeRow,
  type fetchKnowledgesParams
} from './repository'
import {
  fetchKnowledgeDocsParamsSchema,
  knowledgeCreateSchema,
  type FetchKnowledgeDocsParams,
  type KnowledgeCreateFormValues
} from './schemas'

export type {
  FetchKnowledgeDocsResult,
  FetchKnowledgesResult,
  KnowledgeDocRow,
  KnowledgeOption,
  KnowledgeRow,
  fetchKnowledgesParams,
  KnowLedgesWithTotal
} from './repository'

export async function fetchAllKnowledges(): Promise<KnowledgeOption[]> {
  await requireRoles(['admin'])
  return findAllKnowledges()
}

export async function fetchKnowledges(
  params: fetchKnowledgesParams
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
    throw new ValidationError(z.prettifyError(validation.error))
  }

  return findKnowledgeDocs(validation.data)
}

export async function embeddingKnowledge(knowledge: KnowLedgeWithDocs) {
  const { embedDoc } = await import('../embedding/service')
  const docs = knowledge.knowledgeDocs.map(kd => kd.doc)

  for (const doc of docs) {
    await embedDoc(doc)
  }
}

export async function createKnowledge(
  data: KnowledgeCreateFormValues
): Promise<Knowledge> {
  const user = await requireRoles(['admin'])
  const validation = knowledgeCreateSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const knowledge = await createKnowledgeRecord({
    ...validation.data,
    userId: user.id
  })

  void embeddingKnowledge(knowledge).catch(error => {
    console.error(`Failed to embed knowledge ${knowledge.id}:`, error)
  })

  return knowledge
}
