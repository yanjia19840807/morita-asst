import type { DocCate } from '@/generated/prisma/client'
import { requireRoles } from '@/modules/auth/service'
import z from 'zod'
import {
  createDocCateRecord,
  createDocs,
  deleteDocs as deleteDocRecords,
  findDocCates,
  findDocs,
  reorderDocCateRecords,
  updateDocCateRecord,
  type DocRow,
  type FetchDocsResult
} from './repository'
import {
  deleteDocsParamsSchema,
  docCateCreateFormSchema,
  docCateEditFormSchema,
  docCateReorderSchema,
  docCreateSchema,
  fetchDocsParamsSchema,
  type DocCateCreateFormValues,
  type DocCateEditFormValues,
  type DocCateReorderValues,
  type DocCreateValues,
  type FetchDocsParams
} from './schemas'
import { ValidationError } from '@/lib/api/errors'

export type { DocRow, FetchDocsResult }

export async function createDoc(data: DocCreateValues) {
  const user = await requireRoles(['admin'])
  const validation = docCreateSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const { categoryId, files } = validation.data

  return createDocs({
    userId: user.id,
    categoryId,
    files
  })
}

export async function fetchDocs(
  params: FetchDocsParams
): Promise<FetchDocsResult> {
  await requireRoles(['admin'])

  const validation = fetchDocsParamsSchema.safeParse(params)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  return findDocs(validation.data)
}

export async function deleteDocs(ids: string[]) {
  await requireRoles(['admin'])

  const validation = deleteDocsParamsSchema.safeParse(ids)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  return deleteDocRecords(validation.data)
}

export async function createDocCate(
  data: DocCateCreateFormValues
): Promise<DocCate> {
  const user = await requireRoles(['admin'])
  const validation = docCateCreateFormSchema.safeParse(data)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  return createDocCateRecord({
    userId: user.id,
    name: validation.data.name
  })
}

export async function editDocCate(
  data: DocCateEditFormValues
): Promise<DocCate> {
  await requireRoles(['admin'])
  const validation = docCateEditFormSchema.safeParse(data)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  return updateDocCateRecord(validation.data)
}

export async function fetchDocCates(): Promise<DocCate[]> {
  await requireRoles(['admin'])
  return findDocCates()
}

export async function reorderDocCates(
  data: DocCateReorderValues
): Promise<DocCate[]> {
  await requireRoles(['admin'])
  const validation = docCateReorderSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const categories = await findDocCates()
  const sourceCate = categories.find(category => category.id === data.sourceId)
  const targetCate = categories.find(category => category.id === data.targetId)

  if (!sourceCate || !targetCate) {
    throw new ValidationError('排序数据无效')
  }

  if (sourceCate.isDefault || targetCate.isDefault) {
    throw new ValidationError('默认类目不能拖动')
  }

  return reorderDocCateRecords(validation.data)
}
