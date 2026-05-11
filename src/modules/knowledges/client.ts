import qs from 'qs'
import _ from 'lodash'
import type { FetchKnowledgeDocsListResult } from './dto'
import type { FetchKnowledgeDocsParams } from './schemas'
import { ResponseResult } from '@/lib/api/response'
import { getErrorMessage } from '@/lib/utils'

export async function fetchKnowledgeDocsClient(
  params: FetchKnowledgeDocsParams
): Promise<FetchKnowledgeDocsListResult> {
  const { knowledgeId, ...rest } = params
  const searchParams = qs.stringify(
    _.omitBy(rest, value => _.isNil(value) || value === '')
  )

  const response = await fetch(
    `/api/knowledges/${knowledgeId}/docs?${searchParams}`,
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
