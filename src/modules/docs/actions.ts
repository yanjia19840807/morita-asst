'use server'

import type { DocCate } from '@/generated/prisma/client'
import { revalidatePath } from 'next/cache'
import {
  ResponseResult,
  handleActionResult,
  handleActionError
} from '@/lib/api/response'
import type {
  DocCateCreateFormValues,
  DocCateEditFormValues,
  DocCateReorderValues,
  DocCreateValues
} from './schemas'
import {
  createDoc,
  createDocCate,
  deleteDocs,
  editDocCate,
  reorderDocCates
} from './service'

const docPath = '/docs'

export async function createDocAction(
  data: DocCreateValues
): Promise<ResponseResult> {
  try {
    await createDoc(data)
    revalidatePath(docPath)
    return handleActionResult()
  } catch (error) {
    return handleActionError(error)
  }
}

export async function createDocCateAction(
  data: DocCateCreateFormValues
): Promise<ResponseResult<DocCate>> {
  try {
    const cate = await createDocCate(data)
    revalidatePath(docPath)
    return handleActionResult(cate)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function deleteDocsAction(
  ids: string[]
): Promise<ResponseResult<{ count: number }>> {
  try {
    const result = await deleteDocs(ids)
    revalidatePath(docPath)
    return handleActionResult({ count: result.count })
  } catch (error) {
    return handleActionError(error)
  }
}

export async function editDocCateAction(
  data: DocCateEditFormValues
): Promise<ResponseResult<DocCate>> {
  try {
    const cate = await editDocCate(data)
    revalidatePath(docPath)
    return handleActionResult(cate)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function reorderDocCatesAction(
  data: DocCateReorderValues
): Promise<ResponseResult<DocCate[]>> {
  try {
    const categories = await reorderDocCates(data)
    revalidatePath(docPath)
    return handleActionResult(categories)
  } catch (error) {
    return handleActionError(error)
  }
}
