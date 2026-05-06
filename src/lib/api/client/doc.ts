import qs from 'qs'
import type { DocumentCategory } from '@/generated/prisma/client'
import { FetchDocsParams } from '@/schemas/doc'
import { getErrorMessage, ResponseResult } from '@/lib/api/shared/response'
import { FetchDocsResult } from '@/data-access/doc'
import _ from 'lodash'

export const docCatesQueryKey = ['docCates'] as const

export const initialDocsParams = {
  page: 1,
  pageSize: 10,
  sortBy: 'createdAt' as const,
  sortDirection: 'desc' as const
} satisfies FetchDocsParams

export function getDocsQueryKey(params: FetchDocsParams) {
  return [
    'docs',
    _.omitBy(params, value => _.isNil(value) || value === '')
  ] as const
}

export async function fetchSelectDocCates(): Promise<DocumentCategory[]> {
  const response = await fetch('/api/docs/select/cates', {
    method: 'GET',
    cache: 'no-store'
  })

  const payload = (await response.json()) as ResponseResult<DocumentCategory[]>

  if (!response.ok) {
    throw new Error(
      !payload.success ? getErrorMessage(payload.error) : '获取文档类目失败'
    )
  }

  if (!payload.success) {
    throw new Error(getErrorMessage(payload.error))
  }

  return payload.data
}

export async function fetchSelectDocs(
  params: FetchDocsParams
): Promise<FetchDocsResult> {
  const searchParams = qs.stringify(
    _.omitBy(params, value => _.isNil(value) || value === '')
  )

  const response = await fetch(`/api/docs/select?${searchParams}`, {
    method: 'GET',
    cache: 'no-store'
  })

  const payload = (await response.json()) as ResponseResult<FetchDocsResult>

  if (!response.ok) {
    throw new Error(
      !payload.success ? getErrorMessage(payload.error) : '获取文档列表失败'
    )
  }

  if (!payload.success) {
    throw new Error(getErrorMessage(payload.error))
  }

  return payload.data
}
