import qs from 'qs'
import type {
  FetchKnowledgeChunkListWithTotalDto,
  FetchKnowledgeDocListWithTotalDto,
  KnowledgeDetailDto
} from './dto'
import type {
  FetchKnowledgeChunksParams,
  FetchKnowledgeDocsParams
} from './schemas'
import { ResponseResult } from '@/lib/api/response'
import { getErrorMessage } from '@/lib/utils'

export function getKnowledgeQueryKey(knowledgeId: string) {
  return ['knowledges', knowledgeId] as const
}

export function getKnowledgeDocsQueryKey(params: FetchKnowledgeDocsParams) {
  const { knowledgeId, ...rest } = params
  return ['knowledges', knowledgeId, 'docs', rest] as const
}

export function getKnowledgeChunksQueryKey(params: FetchKnowledgeChunksParams) {
  const { knowledgeId, ...rest } = params
  return ['knowledges', knowledgeId, 'chunks', rest] as const
}

export async function queryKnowledgeById(
  knowledgeId: string
): Promise<KnowledgeDetailDto> {
  const response = await fetch(`/api/knowledges/${knowledgeId}`, {
    method: 'GET',
    cache: 'no-store'
  })

  const payload = (await response.json()) as ResponseResult<KnowledgeDetailDto>

  if (!response.ok) {
    throw new Error('获取知识库详情失败')
  }

  if (!payload.success) {
    throw new Error(getErrorMessage(payload.error) || '获取知识库详情失败')
  }

  return payload.data
}

export async function queryKnowledgeDocs(
  params: FetchKnowledgeDocsParams
): Promise<FetchKnowledgeDocListWithTotalDto> {
  const { knowledgeId, ...rest } = params
  const searchParams = qs.stringify(rest)

  const response = await fetch(
    `/api/knowledges/${knowledgeId}/docs?${searchParams}`,
    {
      method: 'GET',
      cache: 'no-store'
    }
  )

  const payload =
    (await response.json()) as ResponseResult<FetchKnowledgeDocListWithTotalDto>

  if (!response.ok) {
    throw new Error('获取知识库文档失败')
  }

  if (!payload.success) {
    throw new Error(getErrorMessage(payload.error) || '获取知识库文档失败')
  }

  return payload.data
}

export async function queryKnowledgeChunks(
  params: FetchKnowledgeChunksParams
): Promise<FetchKnowledgeChunkListWithTotalDto> {
  const { knowledgeId, ...rest } = params
  const searchParams = qs.stringify(rest)

  const response = await fetch(
    `/api/knowledges/${knowledgeId}/chunks?${searchParams}`,
    {
      method: 'GET',
      cache: 'no-store'
    }
  )

  const payload =
    (await response.json()) as ResponseResult<FetchKnowledgeChunkListWithTotalDto>

  if (!response.ok) {
    throw new Error('获取 Chunk 列表失败')
  }

  if (!payload.success) {
    throw new Error(getErrorMessage(payload.error) || '获取 Chunk 列表失败')
  }

  return payload.data
}
