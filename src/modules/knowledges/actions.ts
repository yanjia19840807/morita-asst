'use server'

import { revalidatePath } from 'next/cache'
import type { Knowledge } from '@/generated/prisma/client'
import {
  ResponseResult,
  handleActionResult,
  handleActionError
} from '@/lib/api/response'
import type {
  AddKnowledgeDocsInput,
  KnowledgeCreateFormValues,
  KnowledgeUpdateFormValues,
  RemoveKnowledgeDocInput
} from './schemas'
import {
  addKnowledgeDocs,
  createKnowledge,
  deleteKnowledge,
  removeKnowledgeDoc,
  updateKnowledge
} from './service'

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

export async function updateKnowledgeAction(
  data: KnowledgeUpdateFormValues
): Promise<
  ResponseResult<{
    id: string
    name: string
    description: string | null
    addedCount: number
  }>
> {
  try {
    const result = await updateKnowledge(data)
    revalidatePath(knowledgePath)
    revalidatePath(`${knowledgePath}/${data.id}`)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function addKnowledgeDocsAction(
  data: AddKnowledgeDocsInput
): Promise<ResponseResult<{ knowledgeId: string; addedCount: number }>> {
  try {
    const result = await addKnowledgeDocs(data)
    revalidatePath(knowledgePath)
    revalidatePath(`${knowledgePath}/${data.knowledgeId}`)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function removeKnowledgeDocAction(
  data: RemoveKnowledgeDocInput
): Promise<
  ResponseResult<{ id: string; knowledgeId: string; filename: string }>
> {
  try {
    const result = await removeKnowledgeDoc(data)
    revalidatePath(knowledgePath)
    revalidatePath(`${knowledgePath}/${data.knowledgeId}`)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function deleteKnowledgeAction(
  id: string
): Promise<ResponseResult<{ id: string; name: string }>> {
  try {
    const result = await deleteKnowledge(id)
    revalidatePath(knowledgePath)
    revalidatePath(`${knowledgePath}/${id}`)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}
