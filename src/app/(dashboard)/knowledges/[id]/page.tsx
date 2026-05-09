import { KnowledgeDetail } from '@/components/knowledges/knowledge-detail'
import { fetchKnowledgeById, fetchKnowledgeDocs } from '@/dal/knowledges'
import { toFetchKnowledgeDocsListResult } from '@/lib/api/shared/knowledge'
import { getQueryClient } from '@/lib/get-query-client'
import { FetchKnowledgeDocsParams } from '@/schemas/knowledge'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

export default async function KnowledgeDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const queryClient = getQueryClient()
  const knowledge = await fetchKnowledgeById(id)

  const knowledgeDocsParams: FetchKnowledgeDocsParams = {
    knowledgeId: id
  }

  await queryClient.prefetchQuery({
    queryKey: ['knowledge-docs', knowledgeDocsParams],
    queryFn: async () =>
      toFetchKnowledgeDocsListResult(
        await fetchKnowledgeDocs(knowledgeDocsParams)
      )
  })

  return (
    <div className='flex flex-1 flex-col gap-3 px-4'>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <KnowledgeDetail knowledge={knowledge} />
      </HydrationBoundary>
    </div>
  )
}
