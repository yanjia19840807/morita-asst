import KnowledgeForm from '@/components/knowledge/knowledge-form'
import { fetchDocCates, fetchDocs } from '@/data-access/doc'
import {
  docCatesQueryKey,
  getDocsQueryKey,
  initialDocsParams
} from '@/lib/api/client/doc'
import { getQueryClient } from '@/lib/get-query-client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

export default async function KnowledgeNewPage() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: docCatesQueryKey,
    queryFn: fetchDocCates
  })

  await queryClient.prefetchQuery({
    queryKey: getDocsQueryKey(initialDocsParams),
    queryFn: () => fetchDocs(initialDocsParams)
  })

  return (
    <div className='px-4'>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <KnowledgeForm />
      </HydrationBoundary>
    </div>
  )
}
