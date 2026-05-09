import qs from 'qs'
import _ from 'lodash'
import type { FetchKnowledgeDocsParams } from '@/schemas/knowledge'
import type { FetchKnowledgeDocsListResult } from '@/lib/api/shared/knowledge'
import { getErrorMessage, type ResponseResult } from '@/lib/api/shared/response'

export async function fetchKnowledgeDocsClient(
  params: FetchKnowledgeDocsParams
): Promise<FetchKnowledgeDocsListResult> {
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
    (await response.json()) as ResponseResult<FetchKnowledgeDocsListResult>

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
