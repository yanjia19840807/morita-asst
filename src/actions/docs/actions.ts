'use server'

import { revalidatePath } from 'next/cache'
import {
  createDocCate,
  createDoc,
  editDocCate,
  reorderDocCates
} from '@/dal/docs'
import {
  DocCreateValues,
  DocCateCreateFormValues,
  DocCateEditFormValues,
  DocCateReorderValues
} from '@/schemas/doc'
import { DocCate } from '@/generated/prisma/client'
import { ResponseResult } from '@/lib/api/shared/response'
import {
  handleActionError,
  handleActionResult
} from '@/lib/api/server/response'

const docPath = '/documents'

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
