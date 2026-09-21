import type { Knowledge } from '@/generated/prisma/client'
import { requireRoles } from '@/modules/auth/service'
import { ValidationError } from '@/lib/api/errors'
import {
  sendKnowledgeDocsIngest,
  sendKnowledgeIngest
} from './indexing/service'
import { formatZodError } from '../../lib/zod'
import {
  addKnowledgeDocsRecord,
  createKnowledgeRecord,
  deleteKnowledgeRecord,
  findAllKnowledges,
  findKnowledgeById,
  findKnowledgeChunks,
  findKnowledgeDocs,
  findKnowledges,
  removeKnowledgeDocRecord,
  updateKnowledgeRecord,
  type FetchKnowledgeChunksResult,
  type FetchKnowledgeDocsResult,
  type FetchKnowledgesParams,
  type FetchKnowledgesResult,
  type KnowledgeOption,
  type KnowledgeRow
} from './repository'
import {
  addKnowledgeDocsSchema,
  fetchKnowledgeChunksParamsSchema,
  type FetchKnowledgeChunksParams,
  fetchKnowledgeDocsParamsSchema,
  knowledgeCreateSchema,
  knowledgeIdSchema,
  knowledgeUpdateSchema,
  removeKnowledgeDocSchema,
  type AddKnowledgeDocsInput,
  type FetchKnowledgeDocsParams,
  type KnowledgeCreateFormValues,
  type KnowledgeUpdateFormValues,
  type RemoveKnowledgeDocInput
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

export async function updateKnowledge(data: KnowledgeUpdateFormValues) {
  await requireRoles(['admin'])
  const validation = knowledgeUpdateSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(formatZodError(validation.error))
  }

  const updated = await updateKnowledgeRecord({
    id: validation.data.id,
    name: validation.data.name,
    description: validation.data.description
  })

  let addedCount = 0

  if (validation.data.docSource) {
    const added = await addKnowledgeDocsRecord(
      validation.data.id,
      validation.data.docSource
    )
    addedCount = added.length

    void sendKnowledgeDocsIngest(
      validation.data.id,
      added.map(item => item.id)
    ).catch(error => {
      console.error(
        `Failed to enqueue added docs for knowledge ${validation.data.id}:`,
        error
      )
    })
  }

  return {
    ...updated,
    addedCount
  }
}

export async function addKnowledgeDocs(data: AddKnowledgeDocsInput) {
  await requireRoles(['admin'])
  const validation = addKnowledgeDocsSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(formatZodError(validation.error))
  }

  const added = await addKnowledgeDocsRecord(
    validation.data.knowledgeId,
    validation.data.docSource
  )

  void sendKnowledgeDocsIngest(
    validation.data.knowledgeId,
    added.map(item => item.id)
  ).catch(error => {
    console.error(
      `Failed to enqueue added docs for knowledge ${validation.data.knowledgeId}:`,
      error
    )
  })

  return {
    knowledgeId: validation.data.knowledgeId,
    addedCount: added.length
  }
}

export async function removeKnowledgeDoc(data: RemoveKnowledgeDocInput) {
  await requireRoles(['admin'])
  const validation = removeKnowledgeDocSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(formatZodError(validation.error))
  }

  return removeKnowledgeDocRecord(
    validation.data.knowledgeId,
    validation.data.knowledgeDocId
  )
}

export async function deleteKnowledge(id: string) {
  await requireRoles(['admin'])
  const validation = knowledgeIdSchema.safeParse(id)

  if (!validation.success) {
    throw new ValidationError(formatZodError(validation.error))
  }

  return deleteKnowledgeRecord(validation.data)
}
