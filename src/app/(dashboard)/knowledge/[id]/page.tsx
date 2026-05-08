import { KnowledgeDetail } from '@/components/knowledge/knowledge-detail'
import {
  fetchKnowledgeById,
  fetchKnowledgeDocuments
} from '@/data-access/knowledge'
import {
  getKnowledgeDocumentsQueryKey,
  initialKnowledgeDocumentsParams
} from '@/lib/api/client/knowledge'
import { toFetchKnowledgeDocumentsListResult } from '@/lib/api/shared/knowledge'
import { getQueryClient } from '@/lib/get-query-client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

export default async function KnowledgeDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const queryClient = getQueryClient()
  const knowledge = await fetchKnowledgeById(id)

  await queryClient.prefetchQuery({
    queryKey: getKnowledgeDocumentsQueryKey({
      knowledgeId: id,
      ...initialKnowledgeDocumentsParams
    }),
    queryFn: async () =>
      toFetchKnowledgeDocumentsListResult(
        await fetchKnowledgeDocuments({
          knowledgeId: id,
          ...initialKnowledgeDocumentsParams
        })
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
