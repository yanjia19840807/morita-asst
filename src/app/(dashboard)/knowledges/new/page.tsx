import KnowledgeForm from '@/components/knowledges/knowledge-form'
import { fetchDocCates, fetchDocs } from '@/dal/docs'
import {
  docCatesQueryKey,
  getDocsQueryKey,
  initialDocsParams
} from '@/lib/api/client/doc'
import {
  toFetchSelectDocsResult,
  toSelectDocCateItems
} from '@/lib/api/shared/doc'
import { getQueryClient } from '@/lib/get-query-client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

export default async function KnowledgeNewPage() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: docCatesQueryKey,
    queryFn: async () => toSelectDocCateItems(await fetchDocCates())
  })

  await queryClient.prefetchQuery({
    queryKey: getDocsQueryKey(initialDocsParams),
    queryFn: async () =>
      toFetchSelectDocsResult(await fetchDocs(initialDocsParams))
  })

  return (
    <div className='px-4'>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <KnowledgeForm />
      </HydrationBoundary>
    </div>
  )
}
