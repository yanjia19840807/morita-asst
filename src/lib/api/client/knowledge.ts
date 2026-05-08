import qs from 'qs'
import _ from 'lodash'
import type { FetchKnowledgeDocumentsParams } from '@/schemas/knowledge'
import type { FetchKnowledgeDocumentsListResult } from '@/lib/api/shared/knowledge'
import { getErrorMessage, type ResponseResult } from '@/lib/api/shared/response'

export const initialKnowledgeDocumentsParams = {
  page: 1,
  pageSize: 10,
  sortBy: 'createdAt' as const,
  sortDirection: 'desc' as const
}

export function getKnowledgeDocumentsQueryKey(
  params: FetchKnowledgeDocumentsParams
) {
  return [
    'knowledge-documents',
    _.omitBy(params, value => _.isNil(value) || value === '')
  ] as const
}

export async function fetchKnowledgeDocumentsClient(
  params: FetchKnowledgeDocumentsParams
): Promise<FetchKnowledgeDocumentsListResult> {
  const { knowledgeId, ...rest } = params
  const searchParams = qs.stringify(
    _.omitBy(rest, value => _.isNil(value) || value === '')
  )

  const response = await fetch(
    `/api/knowledge/${knowledgeId}/documents?${searchParams}`,
    {
      method: 'GET',
      cache: 'no-store'
    }
  )

  const payload =
    (await response.json()) as ResponseResult<FetchKnowledgeDocumentsListResult>

  if (!response.ok) {
    throw new Error(
      !payload.success ? getErrorMessage(payload.error) : '获取知识库文档失败'
    )
  }

  if (!payload.success) {
    throw new Error(getErrorMessage(payload.error))
  }

  return payload.data
}
