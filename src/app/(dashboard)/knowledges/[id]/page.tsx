import { KnowledgeDetail } from '@/components/knowledges/knowledge-detail'
import { getQueryClient } from '@/lib/get-query-client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import {
  getKnowledgeQueryKey,
  getKnowledgeDocsQueryKey
} from '@/modules/knowledges/client'
import { getKnowledgeIndexSummaryQueryKey } from '@/modules/knowledges/indexing/client'
import {
  toKnowledgeDto,
  toFetchKnowledgeDocsListResult
} from '@/modules/knowledges/mapper'
import { FetchKnowledgeDocsParams } from '@/modules/knowledges/schemas'
import {
  fetchKnowledgeById,
  fetchKnowledgeDocs
} from '@/modules/knowledges/service'
import { fetchKnowledgeIndexSummary } from '@/modules/knowledges/indexing/service'

export default async function KnowledgeDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const queryClient = getQueryClient()

  const knowledgeDocsParams: FetchKnowledgeDocsParams = {
    knowledgeId: id
  }

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: getKnowledgeQueryKey(id),
      queryFn: async () => toKnowledgeDto(await fetchKnowledgeById(id))
    }),
    queryClient.prefetchQuery({
      queryKey: getKnowledgeIndexSummaryQueryKey(id),
      queryFn: () => fetchKnowledgeIndexSummary(id)
    }),
    queryClient.prefetchQuery({
      queryKey: getKnowledgeDocsQueryKey(knowledgeDocsParams),
      queryFn: async () =>
        toFetchKnowledgeDocsListResult(
          await fetchKnowledgeDocs(knowledgeDocsParams)
        )
    })
  ])

  return (
    <div className='flex flex-1 flex-col gap-3 px-4'>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <KnowledgeDetail knowledgeId={id} />
      </HydrationBoundary>
    </div>
  )
}
