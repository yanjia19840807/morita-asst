import { KnowledgeDetail } from '@/components/knowledges/knowledge-detail'
import { getQueryClient } from '@/lib/get-query-client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { toFetchKnowledgeDocsListResult } from '@/modules/knowledges/mapper'
import { FetchKnowledgeDocsParams } from '@/modules/knowledges/schemas'
import {
  fetchKnowledgeById,
  fetchKnowledgeDocs
} from '@/modules/knowledges/service'

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
