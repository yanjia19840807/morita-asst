import type { ResponseResult } from '@/lib/api/response'
import { getErrorMessage } from '@/lib/utils'
import type { KnowledgeIndexSummary } from './service'

export function getKnowledgeIndexSummaryQueryKey(knowledgeId: string) {
  return ['knowledges', knowledgeId, 'index-summary'] as const
}

export async function queryKnowledgeIndexSummary(
  knowledgeId: string
): Promise<KnowledgeIndexSummary> {
  const response = await fetch(`/api/knowledges/${knowledgeId}/index-summary`, {
    method: 'GET',
    cache: 'no-store'
  })

  const payload =
    (await response.json()) as ResponseResult<KnowledgeIndexSummary>

  if (!response.ok) {
    throw new Error('获取索引状态失败')
  }

  if (!payload.success) {
    throw new Error(getErrorMessage(payload.error) || '获取索引状态失败')
  }

  return payload.data
}
