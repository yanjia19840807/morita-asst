'use server'

import { revalidatePath } from 'next/cache'
import {
  createDocCate,
  createDoc,
  editDocCate,
  reorderDocCates
} from '@/data-access/doc'
import {
  DocCreateActionValues,
  DocCateCreateFormValues,
  DocCateEditFormValues,
  DocCateReorderValues
} from '@/schemas/doc'
import { DocumentCategory } from '@/generated/prisma/client'
import {
  handleActionError,
  handleActionResult,
  ResponseResult
} from '@/lib/api/response'

const docPath = '/documents'

export async function createDocAction(
  data: DocCreateActionValues
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
): Promise<ResponseResult<DocumentCategory>> {
  try {
    const cate = await createDocCate(data)
    revalidatePath(docPath)
    return handleActionResult(cate)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function editDocCateAction(
  data: DocCateEditFormValues
): Promise<ResponseResult<DocumentCategory>> {
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
): Promise<ResponseResult<DocumentCategory[]>> {
  try {
    const categories = await reorderDocCates(data)
    revalidatePath(docPath)
    return handleActionResult(categories)
  } catch (error) {
    return handleActionError(error)
  }
}
