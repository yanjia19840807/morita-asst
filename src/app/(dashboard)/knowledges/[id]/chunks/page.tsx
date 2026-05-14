import { KnowledgeChunksDetail } from '@/components/knowledges/knowledge-chunks-detail'
import { getPage } from '@/lib/pagination'
import {
  toFetchKnowledgeChunksListDto,
  toKnowledgeDto
} from '@/modules/knowledges/mapper'
import { FetchKnowledgeChunksParams } from '@/modules/knowledges/schemas'
import {
  fetchKnowledgeById,
  fetchKnowledgeChunks
} from '@/modules/knowledges/service'

const pageSize = 10

export default async function KnowledgeChunksPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<FetchKnowledgeChunksParams>
}) {
  const { id } = await params
  const { page, searchValue, sortBy, sortDirection } = await searchParams

  const knowledgeChunksParams: FetchKnowledgeChunksParams = {
    knowledgeId: id,
    pageSize,
    page: getPage(page),
    searchValue,
    sortBy,
    sortDirection
  }

  const [knowledge, chunkResult] = await Promise.all([
    fetchKnowledgeById(id),
    fetchKnowledgeChunks(knowledgeChunksParams)
  ])

  const knowledgeDto = toKnowledgeDto(knowledge)
  const chunkDto = toFetchKnowledgeChunksListDto(chunkResult)

  return (
    <KnowledgeChunksDetail
      knowledgeId={id}
      knowledge={knowledgeDto}
      chunks={chunkDto.chunks}
      total={chunkDto.total}
      pageSize={pageSize}
    />
  )
}
