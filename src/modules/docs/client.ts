import qs from 'qs'
import _ from 'lodash'
import { getErrorMessage } from '@/lib/utils'
import type { FetchSelectDocsResult, SelectDocCateItem } from './dto'
import type { FetchDocsParams } from './schemas'
import { ResponseResult } from '@/lib/api/response'

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

export async function fetchSelectDocCates(): Promise<SelectDocCateItem[]> {
  const response = await fetch('/api/docs/select/cates', {
    method: 'GET',
    cache: 'no-store'
  })

  const payload = (await response.json()) as ResponseResult<SelectDocCateItem[]>

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
): Promise<FetchSelectDocsResult> {
  const searchParams = qs.stringify(
    _.omitBy(params, value => _.isNil(value) || value === '')
  )

  const response = await fetch(`/api/docs/select?${searchParams}`, {
    method: 'GET',
    cache: 'no-store'
  })

  const payload =
    (await response.json()) as ResponseResult<FetchSelectDocsResult>

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
