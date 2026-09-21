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
  deleteDocCate,
  deleteDocs,
  editDocCate,
  reorderDocCates
} from './service'

const docPath = '/docs'
const docCatePath = '/docs/categories'

function revalidateDocPaths() {
  revalidatePath(docPath)
  revalidatePath(docCatePath)
}

export async function createDocAction(
  data: DocCreateValues
): Promise<ResponseResult> {
  try {
    await createDoc(data)
    revalidateDocPaths()
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
    revalidateDocPaths()
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
    revalidateDocPaths()
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
    revalidateDocPaths()
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
    revalidateDocPaths()
    return handleActionResult(categories)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function deleteDocCateAction(
  id: string
): Promise<ResponseResult<{ id: string; name: string }>> {
  try {
    const category = await deleteDocCate(id)
    revalidateDocPaths()
    return handleActionResult({
      id: category.id,
      name: category.name
    })
  } catch (error) {
    return handleActionError(error)
  }
}
