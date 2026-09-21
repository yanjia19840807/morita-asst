import KnowledgeForm from '@/components/knowledges/knowledge-form'
import { PageShell } from '@/components/layout/page-shell'
import { fetchDocCates, fetchDocs } from '@/modules/docs/service'
import {
  docCatesQueryKey,
  getDocsQueryKey,
  initialDocsParams
} from '@/modules/docs/client'
import {
  toFetchSelectDocsResult,
  toSelectDocCateItems
} from '@/modules/docs/mapper'
import { getQueryClient } from '@/lib/get-query-client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { fetchKnowledgeById } from '@/modules/knowledges/service'

export default async function KnowledgeEditPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const knowledge = await fetchKnowledgeById(id)
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
    <PageShell>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <KnowledgeForm
          knowledge={{
            id: knowledge.id,
            name: knowledge.name,
            description: knowledge.description
          }}
        />
      </HydrationBoundary>
    </PageShell>
  )
}
